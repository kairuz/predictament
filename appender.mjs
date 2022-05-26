import * as config from "./common/config.mjs";
import * as physics from "./common/physics.mjs";
import {MassiveBodiesFrame, FrameDiffNode, FramesNode} from "./common/domain.mjs";
import {stars, planets, asteroids} from "./common/bodies.mjs";
import {Sequence} from "./common/utils.mjs";


const appendBodiesFrameLoop = (chunkIndex, chunkI, second, tick, massiveBodiesFrames,
                               planetDestroys, asteroidDestroys,
                               frameDiffOrdinalSequence) => {
  physics.tickMassiveBodies(stars, planets, asteroids, second, tick);
  const massiveBodiesFrame = physics.handleMassiveBodiesCollisions(second, tick, stars, planets, asteroids, planetDestroys, asteroidDestroys);
  massiveBodiesFrames[tick] = massiveBodiesFrame;

  if (massiveBodiesFrame.hasDiff()) {
    const frameDiffNode = FrameDiffNode(frameDiffOrdinalSequence.next(), second, tick, massiveBodiesFrame);
    const frameDiffNodeMessage = ['frameDiffNode', frameDiffNode.toArr()];
    postMessage(frameDiffNodeMessage);
  }

  const nextTick = tick + 1;
  const nextChunkI = chunkI + 1;

  if (nextChunkI === config.getAppenderChunkSize()) {
    const framesNode = FramesNode(second, massiveBodiesFrames, 0);
    const framesNodeResultMessage = [
      'framesNodeResult',
      chunkIndex,
      framesNode.toArr(),
      frameDiffOrdinalSequence.getCurr()
    ];
    postMessage(framesNodeResultMessage);

    if (nextTick < config.getTicksPerSecond()) {
      setTimeout(() => appendBodiesFrameLoop(chunkIndex + 1, 0, second, nextTick, [],
                                             massiveBodiesFrame.getPlanetDestroys(), massiveBodiesFrame.getAsteroidDestroys(),
                                             frameDiffOrdinalSequence));
    }
  }
  else if (nextTick < config.getTicksPerSecond()) {
    setTimeout(() => appendBodiesFrameLoop(chunkIndex, nextChunkI, second, nextTick, massiveBodiesFrames,
                                           massiveBodiesFrame.getPlanetDestroys(), massiveBodiesFrame.getAsteroidDestroys(),
                                           frameDiffOrdinalSequence));
  }
};

addEventListener('message', (e) => {
  const data = e.data;

  let ind = 0;
  const second = data[ind++];
  const massiveBodiesFrame = MassiveBodiesFrame.fromArr(data[ind++]);
  const frameDiffOrdinalSequence = Sequence(data[ind++]);

  massiveBodiesFrame.getStarsFrame().forEach((bodyFrame, i) => stars[i].getBodyFrame().set(bodyFrame));
  massiveBodiesFrame.getPlanetsFrame().forEach((bodyFrame, i) => planets[i].getBodyFrame().set(bodyFrame));
  massiveBodiesFrame.getAsteroidsFrame().forEach((bodyFrame, i) => asteroids[i].getBodyFrame().set(bodyFrame));

  appendBodiesFrameLoop(0, 0, second, 0, [],
                        massiveBodiesFrame.getPlanetDestroys(), massiveBodiesFrame.getAsteroidDestroys(),
                        frameDiffOrdinalSequence);
});
