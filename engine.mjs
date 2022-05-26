import * as config from './common/config.mjs';
import {MassiveBodiesFrame, FramesNode, FrameDiffNode, BodyDestroy, PlanetTraversal} from './common/domain.mjs';
import {Timestamp, LinkedQueue, Sequence, DeltaTimer} from './common/utils.mjs';
import * as physics from './common/physics.mjs';
import {stars, planetsStartingBodyFrames, planets, asteroidsStartingBodyFrames, asteroids, units} from './common/bodies.mjs';


const defaultFrameDiffNodeCallback = (_frameDiffNode) => {};
const defaultFramesNodeCallback = (_framesNode) => {};
const defaultAdvanceCallback = (massiveBodiesFrame, unitIndexPlanetTraversal, etherealBodiesCollisions, second, tick) => {};

const Engine = (
  _frameDiffNodeCallback = defaultFrameDiffNodeCallback,
  _framesNodeCallback = defaultFramesNodeCallback,
  _advanceCallback = defaultAdvanceCallback
) => {

  const frameDiffNodeCallback = typeof _frameDiffNodeCallback === 'function' ? _frameDiffNodeCallback : defaultFrameDiffNodeCallback;
  const framesNodeCallback = typeof _framesNodeCallback === 'function' ? _framesNodeCallback : defaultFramesNodeCallback;
  const advanceCallback = typeof _advanceCallback === 'function' ? _advanceCallback : defaultAdvanceCallback;

  let currTimestamp = null;
  let ticksThisSecond = null;
  let currFramesNode = null;
  let currBodiesFrame = null;

  let running = null;

  let startTime;
  let startCallback;

  const appenderDeltaTimer = DeltaTimer();
  const advancerDeltaTimer = DeltaTimer();

  const planetDestroys = new Map();
  const asteroidDestroys = new Map();
  const unitDestroys = new Set();

  const framesBuffer = LinkedQueue();
  const frameDiffBuffer = LinkedQueue();

  const frameDiffOrdinalSequence = Sequence();

  let appenderWorkerWorking = false;
  let appenderWorkerPostedFramesNodeResult = false;

  const players = new Map();

  const unitIndexPlanetTraversal = new Map();
  const planetsTraversals = (() => {
    const planetsTraversals = Array(planets.length);
    for (let i = 0; i < planets.length; i++) {
      planetsTraversals[i] = new Set();
    }
    return planetsTraversals;
  })();

  const initialLoad = () => {
    currTimestamp = Timestamp.now();
    const currSecond = currTimestamp.getSecond();
    ticksThisSecond = 0;

    const planetsStartingBodyFramesCopy = [...planetsStartingBodyFrames];
    planets.forEach((planet) => {
      const randomIndex = Math.trunc(Math.random() * planetsStartingBodyFramesCopy.length);
      const randomBodyFrame = planetsStartingBodyFramesCopy[randomIndex];
      planetsStartingBodyFramesCopy.splice(randomIndex, 1);
      planet.getBodyFrame().set(randomBodyFrame);
    });

    const asteroidsStartingBodyFramesCopy = [...asteroidsStartingBodyFrames];
    asteroids.forEach((planet) => {
      const randomIndex = Math.trunc(Math.random() * asteroidsStartingBodyFramesCopy.length);
      const randomBodyFrame = asteroidsStartingBodyFramesCopy[randomIndex];
      asteroidsStartingBodyFramesCopy.splice(randomIndex, 1);
      planet.getBodyFrame().set(randomBodyFrame);
    });

    planets.forEach((planet, i) => planetDestroys.set(i, BodyDestroy(i, currSecond, 0, 0, planet.getBodyFrame().copyOf(), planet.getBodyFrame().copyOf())));
    asteroids.forEach((asteroid, i) => asteroidDestroys.set(i , BodyDestroy(i, currSecond, 0, 0, asteroid.getBodyFrame().copyOf(), asteroid.getBodyFrame().copyOf())));

    units.forEach((unit, i) => {
      unit.getBodyFrame().destroy();
      unitDestroys.add(i);
    });

    const firstBodiesFrame = physics.handleMassiveBodiesCollisions(
      currSecond, 0, stars, planets, asteroids, planetDestroys, asteroidDestroys);
    const firstFrameDiffNode = FrameDiffNode(frameDiffOrdinalSequence.next(), currSecond, 0, firstBodiesFrame);
    frameDiffBuffer.addLast(firstFrameDiffNode);
    frameDiffNodeCallback(firstFrameDiffNode);

    for (let i = 0; i < config.getInitialLoadSeconds(); i++) {
      const second = currSecond + i;
      const massiveBodiesFrames = Array(config.getTicksPerSecond());
      if (i === 0) {
        massiveBodiesFrames[0] = firstBodiesFrame;
      }

      for (let tick = i === 0 ? 1 : 0; tick < config.getTicksPerSecond(); tick++) {
        physics.tickMassiveBodies(stars, planets, asteroids, second, tick);

        const massiveBodiesFrame = physics.handleMassiveBodiesCollisions(
          second, tick, stars, planets, asteroids, planetDestroys, asteroidDestroys);

        massiveBodiesFrames[tick] = massiveBodiesFrame;

        if (massiveBodiesFrame.hasDiff()) {
          const frameDiffNode = FrameDiffNode(frameDiffOrdinalSequence.next(), second, tick, massiveBodiesFrame);
          frameDiffBuffer.addLast(frameDiffNode);
          frameDiffNodeCallback(frameDiffNode);
        }
      }

      const framesNode = FramesNode(second, massiveBodiesFrames, 0);
      framesBuffer.addLast(framesNode);
      framesNodeCallback(framesNode);
      if (i === 0) {
        currFramesNode = framesNode;
        currBodiesFrame = massiveBodiesFrames[0];
      }
    }
  };

  const joinPlayer = (unitIndex, planetIndex, radians = 0) => {
    if (unitDestroys.has(unitIndex)) {
      unitDestroys.delete(unitIndex);
    }

    players.set(unitIndex, true);

    const unit = units[unitIndex];
    const planet = planets[planetIndex];

    const planetTraversal = PlanetTraversal(unitIndex, planetIndex, radians);

    unitIndexPlanetTraversal.set(unitIndex, planetTraversal);
    planetsTraversals[planetIndex].add(unitIndex);

    const planetPosition = currBodiesFrame.getPlanetsFrame()[planetIndex].getPosition();
    unit.getBodyFrame().spawnAtPosXyz(
      planetPosition.getX() + (Math.cos(planetTraversal.getRadians()) * (planet.getRadius() + (unit.getRadius() * 2))),
      0,
      planetPosition.getZ() + (Math.sin(planetTraversal.getRadians()) * (planet.getRadius() + (unit.getRadius() * 2)))
    );
  };

  const leavePlayer = (unitIndex) => {
    const unit = units[unitIndex];
    unit.getBodyFrame().destroy();
    players.delete(unitIndex);

    if (unitIndexPlanetTraversal.has(unitIndex)) {
      const planetTraversal = unitIndexPlanetTraversal.get(unitIndex);
      const planetIndex = planetTraversal.getPlanetIndex();
      unitIndexPlanetTraversal.delete(unitIndex);
      planetsTraversals[planetIndex].delete(unitIndex);
    }

    unitDestroys.add(unitIndex);
  };

  const appenderWorker = new Worker(new URL('./appender.mjs', import.meta.url), {type: 'module'});

  const expectedChunks = (config.getTicksPerSecond() / config.getAppenderChunkSize()) + (config.getTicksPerSecond() % config.getAppenderChunkSize() === 0 ? 0 : 1);

  const framesNodeResults = [];

  appenderWorker.addEventListener('message', (e) => {
    const data = e.data;
    let ind = 0;
    const command = data[ind++];

    switch (command) {
      case 'framesNodeResult': {
        const chunkIndex = data[ind++];
        const framesNodeChunk = FramesNode.fromArr(data[ind++]);
        const currFrameDiffOrdinal = data[ind++];
        framesNodeResults.push([chunkIndex, framesNodeChunk, currFrameDiffOrdinal]);

        if (framesNodeResults.length === expectedChunks) {
          framesNodeResults.sort((a, b) => a[0] > b[0] ? 1 : -1);

          const massiveBodiesFrames = [];
          framesNodeResults.forEach((framesNodeResult) => {
            framesNodeResult[1].getMassiveBodiesFrames().forEach((massiveBodiesFrame) => {
              massiveBodiesFrames.push(massiveBodiesFrame);
            });
          });

          const firstFramesNodeChunk = framesNodeResults.reduce((acc, curr) => {
            if (curr[0] === (expectedChunks - 1)) {
              frameDiffOrdinalSequence.setCurr(curr[2]);
            }
            return curr[0] === 0 ? curr[1] : acc;
          }, framesNodeChunk);
          framesNodeResults.length = 0;

          const framesNode = FramesNode(framesNodeChunk.getSecond(), massiveBodiesFrames, firstFramesNodeChunk.getOffset());

          framesBuffer.addLast(framesNode);

          const massiveBodiesFrame = framesNode.getMassiveBodiesFrames()[framesNode.getMassiveBodiesFrames().length - 1];
          massiveBodiesFrame.getStarsFrame().forEach((bodyFrame, i) => stars[i].getBodyFrame().set(bodyFrame));
          massiveBodiesFrame.getPlanetsFrame().forEach((bodyFrame, i) => planets[i].getBodyFrame().set(bodyFrame));
          massiveBodiesFrame.getAsteroidsFrame().forEach((bodyFrame, i) => asteroids[i].getBodyFrame().set(bodyFrame));
          planetDestroys.clear();
          massiveBodiesFrame.getPlanetDestroys().forEach((planetDestroy, planetIndex) => planetDestroys.set(planetIndex, planetDestroy.copyOf()));
          asteroidDestroys.clear();
          massiveBodiesFrame.getAsteroidDestroys().forEach((asteroidDestroy, asteroidIndex) => asteroidDestroys.set(asteroidIndex, asteroidDestroy.copyOf()));

          framesNodeCallback(framesNode);

          appenderWorkerWorking = false;

          if (appenderWorkerPostedFramesNodeResult === false) {
            appenderWorkerPostedFramesNodeResult = true;
            startCallback();
          }
        }

        break;
      }
      case 'frameDiffNode': {
        const frameDiffNode = FrameDiffNode.fromArr(data[ind++]);
        frameDiffBuffer.addLast(frameDiffNode);
        frameDiffNodeCallback(frameDiffNode);

        break;
      }
      default : {
        console.log('unrecognized command from worker ' + command);
        break;
      }
    }
  });

  const appenderLoop = () => {
    if (running === true) {
      appenderDeltaTimer.update();

      while (framesBuffer.isNotEmpty() &&
             framesBuffer.getFirst().getSecond() < currTimestamp.getSecond()) {
        framesBuffer.pollFirst();
      }

      const framesBufferFull = framesBuffer.getSize() === config.getBufferMaxSize();
      const readyToLoadFramesBuffer = !appenderWorkerWorking && !framesBufferFull;

      if (readyToLoadFramesBuffer) {
        appenderWorkerWorking = true;
        const nextSecond = framesBuffer.isEmpty() ?
                           currTimestamp.getSecond() :
                           framesBuffer.getLast().getSecond() + 1;


        const workerMessage = [
          nextSecond,
          MassiveBodiesFrame.copyFrom(stars, planets, asteroids, planetDestroys, asteroidDestroys).toArr(),
          frameDiffOrdinalSequence.getCurr()
        ];

        appenderWorker.postMessage(workerMessage);
      }


      // setTimeout(appenderLoop, ((config.getGameMillisecond() * config.getMomentMillis()) / 2) - ((config.getGameMillisecond() * config.getMomentMillis()) / 10));
      setTimeout(appenderLoop, ((config.getMomentMillis() / config.getGameMillisecond()) / 2) - ((config.getMomentMillis() / config.getGameMillisecond()) / 10));
    }
    else {
      console.log('appenderLoop stopping');
    }
  };

  const calcExpectedTicksThisSecond = (newTimestamp) => {
    const millisIntoThisSecond = newTimestamp.getMillisecond() % 1000;
    const percentIntoThisSecond = millisIntoThisSecond / 10;
    const expectedTicksThisSecond = Math.min(config.getTicksPerSecond(), Math.trunc(percentIntoThisSecond * (config.getTicksPerSecond() / 100)));
    return expectedTicksThisSecond;
  };

  const advancer = () => {

    advancerDeltaTimer.update();

    const currSecond = currTimestamp.getSecond();
    const newTimestamp = Timestamp.now();
    const newSecond = newTimestamp.getSecond();

    while (frameDiffBuffer.isNotEmpty() &&
           (frameDiffBuffer.getFirst().getSecond() < newSecond ||
            frameDiffBuffer.getFirst().getSecond() === newSecond && frameDiffBuffer.getFirst().getTick() < ticksThisSecond)) {
      frameDiffBuffer.pollFirst();
    }

    for (let i = currSecond; i < newSecond; i++) {
      while (framesBuffer.isNotEmpty() && framesBuffer.getFirst().getSecond() < i) {
        currFramesNode = framesBuffer.pollFirst();
      }

      while (ticksThisSecond < config.getTicksPerSecond()) {
        currBodiesFrame = currFramesNode.getMassiveBodiesFrames()[ticksThisSecond];
        physics.tickEtherealBodies(units, planetsTraversals, unitIndexPlanetTraversal, stars, planets, asteroids, currBodiesFrame);
        const etherealBodiesCollisions = physics.handleEtherealBodiesCollisions(
          units, planetsTraversals, unitIndexPlanetTraversal, unitDestroys, currBodiesFrame, stars, planets, asteroids);
        advanceCallback(currBodiesFrame, unitIndexPlanetTraversal, etherealBodiesCollisions, i, ticksThisSecond);
        ticksThisSecond++;
        const currTime = (1000 * i) + (ticksThisSecond * config.getMomentMillis());
        currTimestamp = Timestamp.fromMillisecond(currTime);
      }
      ticksThisSecond = 0;
    }

    if (framesBuffer.isNotEmpty()) {
      currFramesNode = framesBuffer.getFirst();
    }

    if (framesBuffer.getSize() > 1 && framesBuffer.getFirst().getSecond() < newTimestamp.getSecond()) {
      framesBuffer.pollFirst();
      currFramesNode = framesBuffer.getFirst();
    }

    const expectedTicksThisSecond = calcExpectedTicksThisSecond(newTimestamp);

    while (ticksThisSecond < expectedTicksThisSecond) {
      currBodiesFrame = currFramesNode.getMassiveBodiesFrames()[ticksThisSecond];
      physics.tickEtherealBodies(units, planetsTraversals, unitIndexPlanetTraversal, stars, planets, asteroids, currBodiesFrame);
      const etherealBodiesCollisions = physics.handleEtherealBodiesCollisions(
        units, planetsTraversals, unitIndexPlanetTraversal, unitDestroys, currBodiesFrame, stars, planets, asteroids);
      advanceCallback(currBodiesFrame, unitIndexPlanetTraversal, etherealBodiesCollisions, newSecond, ticksThisSecond);
      ticksThisSecond++;
      const currTime = (1000 * newSecond) + (ticksThisSecond * config.getMomentMillis());
      currTimestamp = Timestamp.fromMillisecond(currTime);
    }
  };

  const advancerLoop = () => {
    if (running === true) {
      advancer();
      // setTimeout(advancerLoop, ((config.getGameMillisecond() * config.getMomentMillis()) / 2) - ((config.getGameMillisecond() * config.getMomentMillis()) / 10));
      setTimeout(advancerLoop, ((config.getMomentMillis() / config.getGameMillisecond()) / 2) - ((config.getMomentMillis() / config.getGameMillisecond()) / 10));
    }
    else {
      console.log('advancerLoop stopping');
    }
  };

  const start = (_startCallback = () => {}) => {
    startCallback = typeof _startCallback === 'function' ? _startCallback : () => {};
    startTime = Timestamp.now();

    if (running === null) {
      initialLoad();

      currTimestamp = Timestamp.now();
      running = true;
      setTimeout(appenderLoop);
      setTimeout(advancerLoop);
      setTimeout(logLoop, 11001);
    }
    else {
      console.warn(`start() invalid state - running=${running}`);
    }
  };

  const stop = () => {
    if (running !== true) {
      console.warn(`stop() invalid state - running=${running}`);
    }
    running = false;
  };

  const log = () => {
    console.log('engine log');
    const now = Timestamp.now();
    const runningMillis = now.getMillisecond() - startTime.getMillisecond();
    const appenderCount = appenderDeltaTimer.getCount();
    const advancerCount = advancerDeltaTimer.getCount();
    console.log(
      `date=${new Date().toISOString()}\n` +
      `${now}: log currTimestamp=${currTimestamp},ticksThisSecond=${ticksThisSecond},runningMillis=${runningMillis},startTime=${startTime}\n` +
      `appenderCount=${appenderCount},msDelta=${appenderCount/runningMillis},high=${appenderDeltaTimer.getHighest().getMillisecond()},low=${appenderDeltaTimer.getLowest().getMillisecond()}\n` +
      `advancerCount=${advancerCount},msDelta=${advancerCount/runningMillis},high=${advancerDeltaTimer.getHighest().getMillisecond()},low=${advancerDeltaTimer.getLowest().getMillisecond()}\n` +
      `framesBuf=size=${framesBuffer.getSize()},first=${framesBuffer.isNotEmpty() ? framesBuffer.getFirst().getSecond() : 'nil'},last=${framesBuffer.isNotEmpty() ? framesBuffer.getLast().getSecond() : 'nil'},\n` +
      `frameDiffBuf=size=${frameDiffBuffer.getSize()},` +
      `first=${frameDiffBuffer.isNotEmpty() ? `${frameDiffBuffer.getFirst().getSecond()}/${frameDiffBuffer.getFirst().getTick()}` : 'nil'},` +
      `last=${frameDiffBuffer.isNotEmpty() ? `{sec=${frameDiffBuffer.getLast().getSecond()}, tick=${frameDiffBuffer.getLast().getTick()}}` : 'nil'}`
    );
  };

  const logLoop = () => {
    if (running) {
      log();
      setTimeout(logLoop, 11001);
    }
    else {
      console.log('engine logLoop stopping');
    }
  };

  return {
    start,
    stop,
    isRunning: () => running === true,
    isStarted: () => running !== null,
    isStopped: () => running === false,
    getStars: () => stars,
    getPlanets: () => planets,
    getAsteroids: () => asteroids,
    getUnits: () => units,
    getPlanetDestroys: () => planetDestroys,
    getAsteroidDestroys: () => asteroidDestroys,
    getUnitDestroys: () => unitDestroys,
    getFramesBuffer: () => framesBuffer,
    getFrameDiffBuffer: () => frameDiffBuffer,
    getCurrTimestamp: () => currTimestamp,
    getCurrFramesNode: () => currFramesNode,
    getCurrBodiesFrame: () => currBodiesFrame,
    getTicksThisSecond: () => ticksThisSecond,
    getAppenderDeltaTimer: () => appenderDeltaTimer,
    getAdvancerDeltaTimer: () => advancerDeltaTimer,
    getStartTime: () => startTime,
    getPlayers: () => players,
    getUnitIndexPlanetTraversal: () => unitIndexPlanetTraversal,
    getPlanetsTraversals: () => planetsTraversals,
    joinPlayer,
    leavePlayer
  };
};


export default Engine;
