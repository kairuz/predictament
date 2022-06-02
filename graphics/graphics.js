import * as config from "../common/config.js";
import drawBodies from "./draw-bodies.js";
import drawOrbits from "./draw-orbits.js";
import drawRobot from "./draw-robot.js";
import Explosion from "./explosion.js";


const defaultGetScale = () => 1;
const defaultIsDrawBodies = () => true;
const defaultIsDrawNames = () => false;
const defaultIsDrawRespawns = () => false;

const Graphics = (
  _backCanvas, _backCanvasContext,
  _orbitCanvas, _orbitCanvasContext,
  _gameCanvas, _gameCanvasContext,
  _backgroundImage = null,
  _bodyImages = {},
  _orbitDrawBuffer,
  _orbitClearBuffer,
  _boosterDrawBuffer,
  _getScale = defaultGetScale,
  _isDrawBodies = defaultIsDrawBodies,
  _isDrawNames = defaultIsDrawNames,
  _isDrawRespawns = defaultIsDrawRespawns
) => {
  const backCanvas = _backCanvas;
  const backCanvasContext = _backCanvasContext;
  const orbitCanvas = _orbitCanvas;
  const orbitCanvasContext = _orbitCanvasContext;
  const gameCanvas = _gameCanvas;
  const gameCanvasContext = _gameCanvasContext;
  const backgroundImage = _backgroundImage;
  const bodyImages = _bodyImages;
  const orbitDrawBuffer = _orbitDrawBuffer;
  const orbitClearBuffer = _orbitClearBuffer;
  const boosterDrawBuffer = _boosterDrawBuffer;
  const getScale = typeof _getScale === 'function' ? _getScale : defaultGetScale;
  const isDrawBodies = typeof _isDrawBodies === 'function' ? _isDrawBodies : defaultIsDrawBodies;
  const isDrawNames = typeof _isDrawNames === 'function' ? _isDrawNames : defaultIsDrawNames;
  const isDrawRespawns = typeof _isDrawRespawns === 'function' ? _isDrawRespawns : defaultIsDrawRespawns;

  const explosions = [];

  const drawBorder = () => {
    backCanvasContext.save();
    backCanvasContext.translate(backCanvas.width / 2, backCanvas.height / 2);
    backCanvasContext.scale(getScale(), getScale());

    if (backgroundImage !== null) {
      backCanvasContext.drawImage(backgroundImage, -config.getMaxDist(), -config.getMaxDist(), config.getMaxDist() * 2, config.getMaxDist() * 2);
      backCanvasContext.strokeStyle = 'white';
      backCanvasContext.lineWidth = 2;
      backCanvasContext.beginPath();
      backCanvasContext.arc(0, 0, config.getMaxDist(), 0, Math.PI*2, true);
      backCanvasContext.stroke();
    }
    else {
      backCanvasContext.fillStyle = 'black';
      backCanvasContext.beginPath();
      backCanvasContext.arc(0, 0, config.getMaxDist(), 0, Math.PI*2, true);
      backCanvasContext.fill();
    }
    backCanvasContext.restore();
  };

  const draw = (player,
    stars, planets, asteroids, units, unitIndexPlanetTraversal, mouseHoverPlanetIndex,
    massiveBodiesFrame, framesBuffer, currTimestamp, ticksThisSecond
  ) => {
    backCanvasContext.save();
    orbitCanvasContext.save();
    gameCanvasContext.save();

    backCanvasContext.translate(backCanvas.width / 2, backCanvas.height / 2);
    backCanvasContext.scale(getScale(), getScale());
    orbitCanvasContext.translate(orbitCanvas.width / 2, orbitCanvas.height / 2);
    orbitCanvasContext.scale(getScale(), getScale());
    gameCanvasContext.translate(gameCanvas.width / 2, gameCanvas.height / 2);
    gameCanvasContext.scale(getScale(), getScale());


    if (orbitDrawBuffer.getSize() > 0) {
      drawOrbits.drawOrbitBuffer(orbitCanvasContext, orbitDrawBuffer, orbitClearBuffer,
                                 currTimestamp.getSecond(), ticksThisSecond,
                                 stars, planets, asteroids);
    }

    if (isDrawBodies()) {
      drawBodies.drawBodiesType(gameCanvasContext, 'S', stars, massiveBodiesFrame.getStarsFrame(), bodyImages);
      drawBodies.drawBodiesType(gameCanvasContext, 'P', planets, massiveBodiesFrame.getPlanetsFrame(), bodyImages);

      if (mouseHoverPlanetIndex !== null) {
        const planetPosition = massiveBodiesFrame.getPlanetsFrame()[mouseHoverPlanetIndex].getPosition();
        const planet = planets[mouseHoverPlanetIndex];
        gameCanvasContext.save();
        gameCanvasContext.beginPath();
        gameCanvasContext.lineWidth = 4;
        gameCanvasContext.strokeStyle = planet.getColor();
        gameCanvasContext.arc(planetPosition.getX(), planetPosition.getZ(), planet.getRadius() + 8, 0, Math.PI * 2, false);
        gameCanvasContext.stroke();
        gameCanvasContext.restore();
      }


      drawBodies.drawBodiesType(gameCanvasContext, 'A', asteroids, massiveBodiesFrame.getAsteroidsFrame(), bodyImages);
      // explosions.forEach((explosion) => explosion.draw(gameCanvasContext));
      explosions.forEach((explosion) => {
        explosion.update();
        explosion.draw(gameCanvasContext);
      });

      units.forEach((unit, i) => {
        if (unit.getBodyFrame().isDestroyed()) {
          return;
        }
        const planetTraversal = unitIndexPlanetTraversal.has(i) ? unitIndexPlanetTraversal.get(i) : null;
        drawRobot.drawRobot(gameCanvasContext, unit, planetTraversal, boosterDrawBuffer);
      });
    }

    const doneExplosionIndexes = [];
    explosions.forEach((explosion, i) => {
      // explosion.update();
      if (explosion.isDone()) {
        doneExplosionIndexes.push(i);
      }
    });
    for (let i = doneExplosionIndexes.length - 1; i >= 0; i--) {
      explosions.splice(doneExplosionIndexes[i], 1);
    }

    if (isDrawNames()) {
      massiveBodiesFrame.getStarsFrame().forEach((bodyFrame, i) => drawBodies.drawName(gameCanvasContext, 'S', i, stars[i], bodyFrame));
      massiveBodiesFrame.getPlanetsFrame().forEach((bodyFrame, i) => drawBodies.drawName(gameCanvasContext, 'P', i, planets[i], bodyFrame));
      massiveBodiesFrame.getAsteroidsFrame().forEach((bodyFrame, i) => drawBodies.drawName(gameCanvasContext, 'A', i, asteroids[i], bodyFrame));
    }

    if (isDrawRespawns()) {
      drawBodies.drawBodiesTypeRespawns(gameCanvasContext, massiveBodiesFrame.getPlanetDestroys(), planets);
      drawBodies.drawBodiesTypeRespawns(gameCanvasContext, massiveBodiesFrame.getAsteroidDestroys(), asteroids);
    }

    backCanvasContext.restore();
    orbitCanvasContext.restore();
    gameCanvasContext.restore();
  };

  const addExplosion = (_position, _velocity, _body) => explosions.push(Explosion(_position, _velocity, _body));

  return {
    draw,
    drawBorder,
    addExplosion
  };
};

const OrbitDrawNode = (_second, _tick, _massiveBodiesFrame, _prevMassiveBodiesFrame) => {
  const second = _second;
  const tick = _tick;
  const massiveBodiesFrame =_massiveBodiesFrame;
  const prevMassiveBodiesFrame = _prevMassiveBodiesFrame;

  return {
    getSecond: () => second,
    getTick: () => tick,
    getMassiveBodiesFrame: () => massiveBodiesFrame,
    getPrevMassiveBodiesFrame: () => prevMassiveBodiesFrame
  }
};

const ExplosionDrawNode = (_position, _velocity, _body, _timestamp) => {
  const position = _position;
  const velocity = _velocity;
  const body = _body;
  const timestamp =_timestamp;

  return {
    getPosition: () => position,
    getVelocity: () => velocity,
    getBody: () => body,
    getTimestamp: () => timestamp
  }
};

const BoosterDrawNode = (_position, _velocity, _timestamp) => {
  const position = _position;
  const velocity = _velocity;
  const timestamp =_timestamp;

  return {
    getPosition: () => position,
    getVelocity: () => velocity,
    getTimestamp: () => timestamp
  }
};


Graphics.OrbitDrawNode = OrbitDrawNode;
Graphics.ExplosionDrawNode = ExplosionDrawNode;
Graphics.BoosterDrawNode = BoosterDrawNode;


export default Graphics;
