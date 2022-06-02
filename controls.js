import * as domain from "./common/domain.js";
import * as utils from "./common/utils.js";
import Graphics from "./graphics/graphics.js";

const defaultGetSound = () => null;
const defaultGetEffects = () => null;
const defaultGetScale = () => 1;

const Controls = (gameCanvas, client, boosterDrawBuffer, _getSound = defaultGetSound, _getEffects = defaultGetEffects, _getScale = defaultGetScale) => {
  const getSound = typeof _getSound === "function" ? _getSound : defaultGetSound;
  const getEffects = typeof _getEffects === "function" ? _getEffects : defaultGetEffects;
  const getScale = typeof _getScale === "function" ? _getScale : defaultGetScale;

  const hasSoundAndEffects = () => getSound() !== null && getEffects() !== null;

  const mousePosition = domain.Vec3(0, 0, 0);

  let mouseHoverPlanetIndex = null;

  const updateMousePosition = (e) => {
    const rect = gameCanvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) - (gameCanvas.width / 2)) / getScale();
    const y = ((e.clientY - rect.top) - (gameCanvas.height / 2)) / getScale();

    mousePosition.setXyz(x, 0, y);
  };

  const updateMousePositionEventListener = (e) => {
    gameCanvas.removeEventListener('mousemove', updateMousePositionEventListener);
    updateMousePosition(e);
    setTimeout(() => {
      gameCanvas.addEventListener('mousemove', updateMousePositionEventListener);
    }, 50);
  };

  gameCanvas.addEventListener('mousemove', updateMousePositionEventListener);

  const mouseHoverPlanet = () => {
    if (client.getPlayer() === null || client.getPlayer().getUnit().getBodyFrame().isDestroyed()) {
      const engine = client.getEngine();
      const planetsFrame = engine.getCurrBodiesFrame().getPlanetsFrame();

      const some = engine.getPlanets().some((planet, i) => {
        const planetFrame = planetsFrame[i];
        if (planetFrame.isNotDestroyed()) {
          const position = planetFrame.getPosition();
          if (mousePosition.getX() > (position.getX() - planet.getRadius()) &&
              mousePosition.getX() < (position.getX() + planet.getRadius()) &&
              mousePosition.getZ() > (position.getZ() - planet.getRadius()) &&
              mousePosition.getZ() < (position.getZ() + planet.getRadius())) {
            mouseHoverPlanetIndex = i;

            return true;
          }
        }
      });

      if (some === false) {
        mouseHoverPlanetIndex = null;
      }
    }
  };

  const mouseHoverPlanetLoop = () => {
    mouseHoverPlanet();
    setTimeout(mouseHoverPlanetLoop, 50);
  };

  setTimeout(mouseHoverPlanetLoop, 0);

  let leftMouseButtonActionRunning = false;

  let lastTraversalDirectionCalculated = utils.Timestamp();
  let traversalDirection = null;

  const calculateTraversalDirection = () => {
    const planetTraversal = client.getPlayer().getPlanetTraversal();
    const planet = client.getEngine().getPlanets()[planetTraversal.getPlanetIndex()];
    const planetBodyFrame = client.getEngine().getCurrBodiesFrame().getPlanetsFrame()[planetTraversal.getPlanetIndex()];
    const planetPosition = planetBodyFrame.getPosition();
    const unitPosition = client.getPlayer().getUnit().getBodyFrame().getPosition();
    const unit = client.getPlayer().getUnit();

    const stepDirectionPosition = ((direction) => {
      const step = (20 / (planet.getRadius() * 100));
      const radians = (planetTraversal.getRadians() + (direction === domain.TraversalDirection.CLOCKWISE ? step: -step)) % (Math.PI * 2);
      const steppedPosition = unitPosition.copyOf();
      steppedPosition.setX(planetPosition.getX() + (Math.cos(radians) * (planet.getRadius() + (unit.getRadius() * 2))));
      steppedPosition.setZ(planetPosition.getZ() + (Math.sin(radians) * (planet.getRadius() + (unit.getRadius() * 2))));
      return steppedPosition;
    });

    const stepClockwisePosition = stepDirectionPosition(domain.TraversalDirection.CLOCKWISE);
    const stepCounterClockwisePosition = stepDirectionPosition(domain.TraversalDirection.COUNTERCLOCKWISE);

    const distanceToClockwisePosition = Math.sqrt(((mousePosition.getX() - stepClockwisePosition.getX()) ** 2) + ((mousePosition.getZ() - stepClockwisePosition.getZ()) ** 2));
    const distanceToCounterClockwisePosition = Math.sqrt(((mousePosition.getX() - stepCounterClockwisePosition.getX()) ** 2) + ((mousePosition.getZ() - stepCounterClockwisePosition.getZ()) ** 2));

    if (distanceToClockwisePosition > distanceToCounterClockwisePosition) {
      return domain.TraversalDirection.COUNTERCLOCKWISE;
    }
    else {
      return domain.TraversalDirection.CLOCKWISE;
    }
  };

  const MouseButtonHolder = (_action = () => {}) => {
    const action = typeof _action === 'function' ? _action : () => {};

    let down = false;

    const actionLoop = () => {
      if (down) {
        action();
        setTimeout(actionLoop, 0);
      }
    };

    return {
      press: () => {
        down = true;
        setTimeout(actionLoop, 0);
      },
      release: () => {
        down = false;
      }
    }
  };

  let boostersPlaying = 0;

  const leftMouseButtonHolder = MouseButtonHolder(() => {
    if (leftMouseButtonActionRunning === false) {
      leftMouseButtonActionRunning = true;

      const playerIsTraversing = client.getPlayer() !== null &&
                                 client.getPlayer().getUnit().getBodyFrame().isNotDestroyed() &&
                                 client.getEngine().getUnitIndexPlanetTraversal().has(client.getPlayer().getUnitIndex());

      if (client.getPlayer() !== null && client.getPlayer().getUnit().getBodyFrame().isNotDestroyed()) {
        if (playerIsTraversing === false) {
          if (hasSoundAndEffects()) {
            if (boostersPlaying < 10) {
              boostersPlaying++;
              getEffects().playBoosterNode();
              setTimeout(() => boostersPlaying--, Math.random() * 2000);
            }
          }

          if (boosterDrawBuffer.getSize() < 10) {
            const bodyFrame = client.getPlayer().getUnit().getBodyFrame();
            const directionVec = domain.Vec3(Math.cos(bodyFrame.getOrientation()), 0, Math.sin(bodyFrame.getOrientation())).mulScalarAndGet(-2);
            const boosterPosition = bodyFrame.getPosition().copyOf().addAndGet(directionVec.copyOf().mulScalarAndGet(10));
            const boosterVelocity = directionVec.copyOf().addAndGet(bodyFrame.getVelocity());
            const boosterDrawNode = Graphics.BoosterDrawNode(boosterPosition, boosterVelocity, utils.Timestamp.now());
            boosterDrawBuffer.addLast(boosterDrawNode);
          }

          client.handleFace(mousePosition);
          client.handleUp();
        }
        else {
          const now = utils.Timestamp.now();
          if (traversalDirection === null || (now.getMillisecond() - lastTraversalDirectionCalculated.getMillisecond() > 100)) {
            lastTraversalDirectionCalculated = now;
            traversalDirection = calculateTraversalDirection();
          }

          if (traversalDirection === domain.TraversalDirection.COUNTERCLOCKWISE) {
            client.handleLeft();
          }
          else {
            client.handleRight();
          }
        }
      }
      setTimeout(() => leftMouseButtonActionRunning = false, 20);
    }
  });

  gameCanvas.addEventListener('mouseout', () => {
    leftMouseButtonHolder.release();
  });

  gameCanvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
      leftMouseButtonHolder.release();
    }
  });

  gameCanvas.addEventListener('contextmenu', (e) => {
    if (e.button === 2) {
      e.preventDefault();
    }
  });

  gameCanvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const playerExists = client.getPlayer() !== null && client.getPlayer().getUnit().getBodyFrame().isNotDestroyed();
    switch (e.button) {
      case 0: {
        if (playerExists) {
          leftMouseButtonHolder.press();
        }
        else if (!playerExists && mouseHoverPlanetIndex !== null) {
          client.leave();
          client.join(mouseHoverPlanetIndex);
          if (hasSoundAndEffects()) {
            getEffects().playSpawnNode();
          }
          mouseHoverPlanetIndex = null;
        }
        break;
      }
      case 2: {
        const playerExistsAndIsTraversing = playerExists && client.getEngine().getUnitIndexPlanetTraversal().has(client.getPlayer().getUnitIndex());
        if (playerExistsAndIsTraversing) {
          client.handleUp();
          if (hasSoundAndEffects()) {
            getEffects().playLeapNode();
          }
        }
        break;
      }
    }
  });

  return {
    getMouseHoverPlanetIndex: () => mouseHoverPlanetIndex
  }

};


export default Controls;
