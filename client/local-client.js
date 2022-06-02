import {units} from "../common/bodies.js";
import {Player, TraversalDirection} from "../common/domain.js";
import Engine from "../engine.js";


const defaultInitCallback = () => {};
const defaultFrameDiffNodeCallback = (_frameDiffNode) => {};
const defaultFramesNodeCallback = (_framesNode) => {};
const defaultAdvanceCallback = (massiveBodiesFrame, units, second, tick) => {};

const LocalClient = (
  _initCallback = defaultInitCallback,
  _frameDiffNodeCallback = defaultFrameDiffNodeCallback,
  _framesNodeCallback = defaultFramesNodeCallback,
  _advanceCallback = defaultAdvanceCallback
) => {

  const initCallback = typeof _initCallback === 'function' ? _initCallback : defaultInitCallback;
  const frameDiffNodeCallback = typeof _frameDiffNodeCallback === 'function' ? _frameDiffNodeCallback : defaultFrameDiffNodeCallback;
  const framesNodeCallback = typeof _framesNodeCallback === 'function' ? _framesNodeCallback : defaultFramesNodeCallback;
  const advanceCallback = typeof _advanceCallback === 'function' ? _advanceCallback : defaultAdvanceCallback;

  const engine = Engine(frameDiffNodeCallback, framesNodeCallback, advanceCallback);
  engine.start(initCallback);

  let player = null;

  const join = (planetIndex) => {
    if (player !== null) {
      throw 'already joined';
    }

    const unitIndex = (() => {
      for (let i = 0; i < units.length; i++) {
        if (!engine.getPlayers().has(i)) {
          return i;
        }
      }
      return null;
    })();

    if (unitIndex === null) {
      throw 'game is full';
    }

    const unit = engine.getUnits()[unitIndex];

    engine.joinPlayer(unitIndex, planetIndex);
    const planetTraversal = engine.getUnitIndexPlanetTraversal().get(unitIndex);
    player = Player(unitIndex, unit, planetTraversal);
  };

  const leave = () => {
    if (player !== null) {
      engine.leavePlayer(player.getUnitIndex());
    }
    player = null;
  };

  const handleLeft = () => {
    if (engine.getUnitIndexPlanetTraversal().has(player.getUnitIndex())) {
      player.getPlanetTraversal().addSpeed(20, TraversalDirection.COUNTERCLOCKWISE, 200);
    }
    else {
      player.getUnit().getBodyFrame().setOrientation(player.getUnit().getBodyFrame().getOrientation() - 0.1);
    }
  };

  const handleRight = () => {
    if (engine.getUnitIndexPlanetTraversal().has(player.getUnitIndex())) {
      player.getPlanetTraversal().addSpeed(20, TraversalDirection.CLOCKWISE, 200);
    }
    else {
      player.getUnit().getBodyFrame().setOrientation(player.getUnit().getBodyFrame().getOrientation() + 0.1);
    }
  };

  const handleUp = () => {
    if (engine.getUnitIndexPlanetTraversal().has(player.getUnitIndex())) {
      const planetTraversal = player.getPlanetTraversal();
      const planetIndex = planetTraversal.getPlanetIndex();
      const planetBodyFrame = engine.getCurrBodiesFrame().getPlanetsFrame()[planetIndex];
      player.discardPlanetTraversal();
      engine.getUnitIndexPlanetTraversal().delete(player.getUnitIndex());
      engine.getPlanetsTraversals()[planetIndex].delete(player.getUnitIndex());
      const unitBodyFrame = player.getUnit().getBodyFrame();
      const unitVelocity = unitBodyFrame.getVelocity();
      unitVelocity.set(planetBodyFrame.getVelocity());
      unitVelocity.addXyz(Math.cos(planetTraversal.getRadians()) * 1, 0, Math.sin(planetTraversal.getRadians()) * 1);
    }
    else {
      const unitBodyFrame = player.getUnit().getBodyFrame();
      const unitVelocity = unitBodyFrame.getVelocity();
      unitVelocity.addXyz(Math.cos(unitBodyFrame.getOrientation()) * 0.02, 0, Math.sin(unitBodyFrame.getOrientation()) * 0.02);
    }
  };

  const handleDown = () => {
    const unitBodyFrame = player.getUnit().getBodyFrame();
    const unitVelocity = unitBodyFrame.getVelocity();
    unitVelocity.addXyz(-Math.cos(unitBodyFrame.getOrientation()) * 0.02, 0, -Math.sin(unitBodyFrame.getOrientation()) * 0.02);
  };

  const handleFace = (point) => {
    const unitBodyFrame = player.getUnit().getBodyFrame();
    const position = unitBodyFrame.getPosition();
    const radians = Math.atan2(point.getZ() - position.getZ(), point.getX() - position.getX());
    unitBodyFrame.setOrientation(radians);
  };

  return {
    join, leave,
    handleLeft, handleRight, handleUp, handleDown, handleFace,
    getEngine: () => engine,
    getPlayer: () => player
  };
};


export default LocalClient;
