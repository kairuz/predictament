import * as config from './config.mjs';
import {Vec3, MassiveBodiesFrame, BodyDestroy, BodySpawn, EtherealBodiesCollisions, PlanetTraversal} from './domain.mjs';
import {planetsStartingBodyFrames, asteroidsStartingBodyFrames} from './bodies.mjs';


// todo: **LOTS** of duplication in this module

const INSCRIBED_SQUARE_SIDE_LENGTH = (() => {
  const diagonal = (config.getMaxDist() / 2);
  return diagonal * Math.sqrt(2);
})();
const getInscribedSquareSideLength = () => INSCRIBED_SQUARE_SIDE_LENGTH;

const calcGravOnBodyFromBody = (onBody, fromBody) => {
  return calcGravOnPositionFromMassFromPosition(
      onBody.getBodyFrame().getPosition(),
      fromBody.getBodyFrame().getPosition(),
      fromBody.getMass()
  );
};

const calcGravOnPositionFromMassFromPosition = (onPosition, fromPosition, fromMass) => {
  if (onPosition.equals(fromPosition)) {
    return Vec3.zero();
  }
  const posDiff = fromPosition.diff(onPosition);
  const distSq = posDiff.sq();
  const distSqAdded = distSq.getX() + distSq.getZ();
  const dist = Math.sqrt(distSqAdded);
  const force = fromMass / distSqAdded;
  const
      ax = ((posDiff.getX() / dist) * force) * config.getGravConstant(),
      az = ((posDiff.getZ() / dist) * force) * config.getGravConstant();
  return Vec3(ax, 0, az);
};

const calcPlanetsGravsFromStars = (planets, stars) => {
  const vec3Zero = Vec3.zero();
  const planetsGravs = Array(planets.length);
  for (let i = 0; i < planets.length; i++) {
    const onPlanet = planets[i];
    if (onPlanet.getBodyFrame().isDestroyed()) {
      planetsGravs[i] = [];
    }
    else {
      const onPlanetGravs = Array(stars.length);
      for (let j = 0; j < stars.length; j++) {
        const fromStar = stars[j];
        if (fromStar.getBodyFrame().isDestroyed()) {
          onPlanetGravs[j] = vec3Zero;
        }
        else {
          const fromStarGrav = calcGravOnBodyFromBody(onPlanet, fromStar);
          onPlanetGravs[j] = fromStarGrav;
        }
      }
      planetsGravs[i] = onPlanetGravs;
    }
  }
  return planetsGravs;
};

const calcAsteroidsGravsFromStars = (asteroids, stars) => {
  const vec3Zero = Vec3.zero();
  const asteroidsGravs = Array(asteroids.length);
  for (let i = 0; i < asteroids.length; i++) {
    const onAsteroid = asteroids[i];
    if (onAsteroid.getBodyFrame().isDestroyed()) {
      asteroidsGravs[i] = [];
    }
    else {
      const onAsteroidGravs = Array(stars.length);
      for (let j = 0; j < stars.length; j++) {
        const fromStar = stars[j];
        if (fromStar.getBodyFrame().isDestroyed()) {
          onAsteroidGravs[j] = vec3Zero;
        }
        else {
          const fromStarGrav = calcGravOnBodyFromBody(onAsteroid, fromStar);
          onAsteroidGravs[j] = fromStarGrav;
        }
      }
      asteroidsGravs[i] = onAsteroidGravs;
    }
  }
  return asteroidsGravs;
};

const calcUnitsGravsFromStars = (units, unitIndexPlanetTraversal, starsFrame, stars) => {
  const vec3Zero = Vec3.zero();
  const unitsGravs = Array(units.length);
  for (let i = 0; i < units.length; i++) {
    const onUnit = units[i];
    if (onUnit.getBodyFrame().isDestroyed() || unitIndexPlanetTraversal.has(i)) {
      unitsGravs[i] = [];
    }
    else {
      const onUnitGravs = Array(starsFrame.length);
      for (let j = 0; j < starsFrame.length; j++) {
        const fromStarFrame = starsFrame[j];
        if (fromStarFrame.isDestroyed()) {
          onUnitGravs[j] = vec3Zero;
        }
        else {
          const fromStar = stars[j];
          const fromStarGrav = calcGravOnPositionFromMassFromPosition(onUnit.getBodyFrame().getPosition(), fromStarFrame.getPosition(), fromStar.getMass());
          onUnitGravs[j] = fromStarGrav;
        }
      }
      unitsGravs[i] = onUnitGravs;
    }
  }
  return unitsGravs;
};

const calcPlanetsGravs = (planets) => {
  const vec3Zero = Vec3.zero();
  const planetsGravs = Array(planets.length);
  for (let i = 0; i < planets.length; i++) {
    const onPlanet = planets[i];
    if (onPlanet.getBodyFrame().isDestroyed()) {
      planetsGravs[i] = [];
    }
    else {
      const onPlanetGravs = Array(planets.length);
      for (let j = 0; j < planets.length; j++) {
        const fromPlanet = planets[j];
        if (fromPlanet.getBodyFrame().isDestroyed()) {
          onPlanetGravs[j] = vec3Zero;
        }
        else {
          const fromPlanetGrav = i === j ? vec3Zero : calcGravOnBodyFromBody(onPlanet, fromPlanet);
          onPlanetGravs[j] = fromPlanetGrav;
        }
      }
      planetsGravs[i] = onPlanetGravs;
    }
  }
  return planetsGravs;
};

const calcAsteroidsGravsFromPlanets = (asteroids, planets) => {
  const vec3Zero = Vec3.zero();
  const asteroidsGravs = Array(asteroids.length);
  for (let i = 0; i < asteroids.length; i++) {
    const onAsteroid = asteroids[i];
    if (onAsteroid.getBodyFrame().isDestroyed()) {
      asteroidsGravs[i] = [];
    }
    else {
      const onAsteroidGravs = Array(planets.length);
      for (let j = 0; j < planets.length; j++) {
        const fromPlanet = planets[j];
        if (fromPlanet.getBodyFrame().isDestroyed()) {
          onAsteroidGravs[j] = vec3Zero;
        }
        else {
          const fromPlanetGrav = calcGravOnBodyFromBody(onAsteroid, fromPlanet);
          onAsteroidGravs[j] = fromPlanetGrav;
        }
      }
      asteroidsGravs[i] = onAsteroidGravs;
    }
  }
  return asteroidsGravs;
};

const calcUnitsGravsFromPlanets = (units, unitIndexPlanetTraversal, planetsFrame, planets) => {
  const vec3Zero = Vec3.zero();
  const unitsGravs = Array(units.length);
  for (let i = 0; i < units.length; i++) {
    const onUnit = units[i];
    if (onUnit.getBodyFrame().isDestroyed() || unitIndexPlanetTraversal.has(i)) {
      unitsGravs[i] = [];
    }
    else {
      const onUnitGravs = Array(planetsFrame.length);
      for (let j = 0; j < planetsFrame.length; j++) {
        const fromPlanetFrame = planetsFrame[j];
        if (fromPlanetFrame.isDestroyed()) {
          onUnitGravs[j] = vec3Zero;
        }
        else {
          const fromPlanet = planets[j];
          const fromPlanetGrav = calcGravOnPositionFromMassFromPosition(onUnit.getBodyFrame().getPosition(), fromPlanetFrame.getPosition(), fromPlanet.getMass());
          onUnitGravs[j] = fromPlanetGrav;
        }
      }
      unitsGravs[i] = onUnitGravs;
    }
  }
  return unitsGravs;
};

// todo: calcAsteroidsGravs and calcUnitsGravsFromAsteroids?

const calcPlanetsCollisionsFromStars = (planets, stars) => {
  const collisions = new Map();
  planets.forEach((planetI, i) => {
    if (planetI.getBodyFrame().isDestroyed()) {
      return;
    }
    stars.forEach((starJ, j) => {
      if (starJ.getBodyFrame().isDestroyed()) {
        return;
      }
      const posI = planetI.getBodyFrame().getPosition();
      const posJ = starJ.getBodyFrame().getPosition();

      const combinedRadius = planetI.getRadius() + starJ.getRadius();
      const xCenterDiff = Math.abs(posI.getX() - posJ.getX());
      const zCenterDiff = Math.abs(posI.getZ() - posJ.getZ());

      if (xCenterDiff < combinedRadius && zCenterDiff < combinedRadius) {
        const distance = Math.sqrt(xCenterDiff ** 2 + zCenterDiff ** 2);
        if (distance < combinedRadius) {
          if (!collisions.has(i)) {
            collisions.set(i, [j]);
          }
          else {
            collisions.get(i).push(j);
          }
        }
      }
    });
  });
  return collisions;
};

const calcAsteroidsCollisionsFromStars = (asteroids, stars) => {
  const collisions = new Map();
  asteroids.forEach((asteroidI, i) => {
    if (asteroidI.getBodyFrame().isDestroyed()) {
      return;
    }
    stars.forEach((starJ, j) => {
      if (starJ.getBodyFrame().isDestroyed()) {
        return;
      }
      const posI = asteroidI.getBodyFrame().getPosition();
      const posJ = starJ.getBodyFrame().getPosition();

      const combinedRadius = asteroidI.getRadius() + starJ.getRadius();
      const xCenterDiff = Math.abs(posI.getX() - posJ.getX());
      const zCenterDiff = Math.abs(posI.getZ() - posJ.getZ());

      if (xCenterDiff < combinedRadius && zCenterDiff < combinedRadius) {
        const distance = Math.sqrt(xCenterDiff ** 2 + zCenterDiff ** 2);
        if (distance < combinedRadius) {
          if (!collisions.has(i)) {
            collisions.set(i, [j]);
          }
          else {
            collisions.get(i).push(j);
          }
        }
      }
    });
  });
  return collisions;
};

const calcUnitsCollisionsFromStars = (units, starsFrame, stars) => {
  const collisions = new Map();
  units.forEach((unitI, i) => {
    if (unitI.getBodyFrame().isDestroyed()) {
      return;
    }
    starsFrame.forEach((starFrameJ, j) => {
      if (starFrameJ.isDestroyed()) {
        return;
      }
      const star = stars[j];
      const posI = unitI.getBodyFrame().getPosition();
      const posJ = starFrameJ.getPosition();

      const combinedRadius = unitI.getRadius() + star.getRadius();
      const xCenterDiff = Math.abs(posI.getX() - posJ.getX());
      const zCenterDiff = Math.abs(posI.getZ() - posJ.getZ());

      if (xCenterDiff < combinedRadius && zCenterDiff < combinedRadius) {
        const distance = Math.sqrt(xCenterDiff ** 2 + zCenterDiff ** 2);
        if (distance < combinedRadius) {
          if (!collisions.has(i)) {
            collisions.set(i, [j]);
          }
          else {
            collisions.get(i).push(j);
          }
        }
      }
    });
  });
  return collisions;
};

const calcPlanetsCollisions = (planets) => {
  const collisions = new Map();
  planets.forEach((planetI, i) => {
    if (planetI.getBodyFrame().isDestroyed()) {
      return;
    }
    planets.forEach((planetJ, j) => {
      if (i === j || planetJ.getBodyFrame().isDestroyed()) {
        return;
      }
      const posI = planetI.getBodyFrame().getPosition();
      const posJ = planetJ.getBodyFrame().getPosition();

      const combinedRadius = planetI.getRadius() + planetJ.getRadius();
      const xCenterDiff = Math.abs(posI.getX() - posJ.getX());
      const zCenterDiff = Math.abs(posI.getZ() - posJ.getZ());

      if (xCenterDiff < combinedRadius && zCenterDiff < combinedRadius) {
        const distance = Math.sqrt(xCenterDiff ** 2 + zCenterDiff ** 2);
        if (distance < combinedRadius) {
          if (!collisions.has(i)) {
            collisions.set(i, [j]);
          }
          else {
            collisions.get(i).push(j);
          }
        }
      }
    });
  });
  return collisions;
};

const calcAsteroidsCollisionsFromPlanets = (asteroids, planets) => {
  const collisions = new Map();
  asteroids.forEach((asteroidI, i) => {
    if (asteroidI.getBodyFrame().isDestroyed()) {
      return;
    }
    planets.forEach((planetJ, j) => {
      if (planetJ.getBodyFrame().isDestroyed()) {
        return;
      }
      const posI = asteroidI.getBodyFrame().getPosition();
      const posJ = planetJ.getBodyFrame().getPosition();

      const combinedRadius = asteroidI.getRadius() + planetJ.getRadius();
      const xCenterDiff = Math.abs(posI.getX() - posJ.getX());
      const zCenterDiff = Math.abs(posI.getZ() - posJ.getZ());

      if (xCenterDiff < combinedRadius && zCenterDiff < combinedRadius) {
        const distance = Math.sqrt(xCenterDiff ** 2 + zCenterDiff ** 2);

        if (distance < combinedRadius) {
          if (!collisions.has(i)) {
            collisions.set(i, [j]);
          }
          else {
            collisions.get(i).push(j);
          }
        }
      }
    });
  });
  return collisions;
};

const calcUnitsCollisionsFromPlanets = (units, unitIndexPlanetTraversal, planetsFrame, planets) => {
  const collisions = new Map();
  units.forEach((unitI, i) => {
    if (unitI.getBodyFrame().isDestroyed()) {
      return;
    }
    planetsFrame.forEach((planetFrameJ, j) => {
      if (planetFrameJ.isDestroyed() || (unitIndexPlanetTraversal.has(i) && unitIndexPlanetTraversal.get(i).getPlanetIndex() === j)) {
        return;
      }
      const planet = planets[j];
      const posI = unitI.getBodyFrame().getPosition();
      const posJ = planetFrameJ.getPosition();

      const combinedRadius = unitI.getRadius() + planet.getRadius();
      const xCenterDiff = Math.abs(posI.getX() - posJ.getX());
      const zCenterDiff = Math.abs(posI.getZ() - posJ.getZ());

      if (xCenterDiff < combinedRadius && zCenterDiff < combinedRadius) {
        const distance = Math.sqrt(xCenterDiff ** 2 + zCenterDiff ** 2);
        if (distance < combinedRadius) {
          if (!collisions.has(i)) {
            collisions.set(i, [j]);
          }
          else {
            collisions.get(i).push(j);
          }
        }
      }
    });
  });
  return collisions;
};

const calcAsteroidsCollisions = (asteroids) => {
  const collisions = new Map();
  asteroids.forEach((asteroidI, i) => {
    if (asteroidI.getBodyFrame().isDestroyed()) {
      return;
    }
    asteroids.forEach((asteroidJ, j) => {
      if (i === j || asteroidJ.getBodyFrame().isDestroyed()) {
        return;
      }
      const posI = asteroidI.getBodyFrame().getPosition();
      const posJ = asteroidJ.getBodyFrame().getPosition();

      const combinedRadius = asteroidI.getRadius() + asteroidJ.getRadius();
      const xCenterDiff = Math.abs(posI.getX() - posJ.getX());
      const zCenterDiff = Math.abs(posI.getZ() - posJ.getZ());

      if (xCenterDiff < combinedRadius && zCenterDiff < combinedRadius) {
        const distance = Math.sqrt(xCenterDiff ** 2 + zCenterDiff ** 2);
        if (distance < combinedRadius) {
          if (!collisions.has(i)) {
            collisions.set(i, [j]);
          }
          else {
            collisions.get(i).push(j);
          }
        }
      }
    });
  });
  return collisions;
};

const calcUnitsCollisionsFromAsteroids = (units, asteroidsFrame, asteroids) => {
  const collisions = new Map();
  units.forEach((unitI, i) => {
    if (unitI.getBodyFrame().isDestroyed()) {
      return;
    }
    asteroidsFrame.forEach((asteroidFrameJ, j) => {
      if (asteroidFrameJ.isDestroyed()) {
        return;
      }
      const asteroid = asteroids[j];
      const posI = unitI.getBodyFrame().getPosition();
      const posJ = asteroidFrameJ.getPosition();

      const combinedRadius = unitI.getRadius() + asteroid.getRadius();
      const xCenterDiff = Math.abs(posI.getX() - posJ.getX());
      const zCenterDiff = Math.abs(posI.getZ() - posJ.getZ());

      if (xCenterDiff < combinedRadius && zCenterDiff < combinedRadius) {
        const distance = Math.sqrt(xCenterDiff ** 2 + zCenterDiff ** 2);
        if (distance < combinedRadius) {
          if (!collisions.has(i)) {
            collisions.set(i, [j]);
          }
          else {
            collisions.get(i).push(j);
          }
        }
      }
    });
  });
  return collisions;
};

const calcUnitsCollisions = (units) => {
  const collisions = new Map();
  units.forEach((unitI, i) => {
    if (unitI.getBodyFrame().isDestroyed()) {
      return;
    }
    units.forEach((unitJ, j) => {
      if (i === j || unitJ.getBodyFrame().isDestroyed()) {
        return;
      }
      const posI = unitI.getBodyFrame().getPosition();
      const posJ = unitJ.getBodyFrame().getPosition();

      const combinedRadius = unitI.getRadius() + unitJ.getRadius();
      const xCenterDiff = Math.abs(posI.getX() - posJ.getX());
      // const yCenterDiff = Math.abs(posI.getY() - posJ.getY());
      const zCenterDiff = Math.abs(posI.getZ() - posJ.getZ());

      if (xCenterDiff < combinedRadius && /*yCenterDiff < combinedRadius ||*/ zCenterDiff < combinedRadius) {
        const distance = Math.sqrt(xCenterDiff ** 2 + /*yCenterDiff ** 2 +*/ zCenterDiff ** 2);
        if (distance < combinedRadius) {
          if (!collisions.has(i)) {
            collisions.set(i, [j]);
          }
          else {
            collisions.get(i).push(j);
          }
        }
      }
    });
  });
  return collisions;
};

const applyGravityForMassiveBodies = (stars, planets, asteroids) => {
  // todo support multiple stars - not applying gravity to stars - currently only single star
  // calcStarsGravs([star]).forEach((onPlanetGravs, i) => {

  calcPlanetsGravsFromStars(planets, stars)
    .forEach((onPlanetGravs, i) => {
      const onPlanet = planets[i];
      if (onPlanet.getBodyFrame().isNotDestroyed()) {
        onPlanetGravs.forEach((fromStarGrav, j) => {
          onPlanet.getBodyFrame().getVelocity().add(fromStarGrav);
        });
      }
    });

  calcPlanetsGravs(planets)
    .forEach((onPlanetGravs, i) => {
      const onPlanet = planets[i];
      if (onPlanet.getBodyFrame().isNotDestroyed()) {
        onPlanetGravs.forEach((fromPlanetGrav, j) => {
          const fromPlanet = planets[j];
          if (i !== j && fromPlanet.getBodyFrame().isNotDestroyed()) {
            onPlanet.getBodyFrame().getVelocity().add(fromPlanetGrav);
          }
        });
      }
    });

  calcAsteroidsGravsFromStars(asteroids, stars)
    .forEach((onAsteroidGravs, i) => {
      const onAsteroid = asteroids[i];
      if (onAsteroid.getBodyFrame().isNotDestroyed()) {
        onAsteroidGravs.forEach((fromStarGrav, j) => {
          onAsteroid.getBodyFrame().getVelocity().add(fromStarGrav);
        });
      }
    });

  calcAsteroidsGravsFromPlanets(asteroids, planets)
    .forEach((onAsteroidGravs, i) => {
      const onAsteroid = asteroids[i];
      if (onAsteroid.getBodyFrame().isNotDestroyed()) {
        onAsteroidGravs.forEach((fromPlanetGrav, j) => {
          const fromPlanet = planets[j];
          if (fromPlanet.getBodyFrame().isNotDestroyed()) {
            onAsteroid.getBodyFrame().getVelocity().add(fromPlanetGrav);
          }
        });
      }
    });
};

const applyVelocityForMassiveBodies = (stars, planets, asteroids, second, tick) => {
  planets
    .filter((planet) => planet.getBodyFrame().isNotDestroyed())
    .forEach((planet) => planet.getBodyFrame().getPosition().add(planet.getBodyFrame().getVelocity()));

  asteroids
    .filter((asteroid) => asteroid.getBodyFrame().isNotDestroyed())
    .forEach((asteroid) => asteroid.getBodyFrame().getPosition().add(asteroid.getBodyFrame().getVelocity()));
};

const tickMassiveBodies = (stars, planets, asteroids, second, tick) => {
  applyGravityForMassiveBodies(stars, planets, asteroids);

  stars
    .filter((star) => star.getBodyFrame().isNotDestroyed())
    .forEach((star) => star.getBodyFrame().rotate());

  planets
    .filter((planet) => planet.getBodyFrame().isNotDestroyed())
    .forEach((planet) => planet.getBodyFrame().rotate());

  asteroids
    .filter((asteroid) => asteroid.getBodyFrame().isNotDestroyed())
    .forEach((asteroid) => asteroid.getBodyFrame().rotate());

  applyVelocityForMassiveBodies(stars, planets, asteroids, second, tick);
};

const applyGravityForEtherealBodies = (units, unitIndexPlanetTraversal, stars, planets, asteroids, massiveBodiesFrame) => {
  calcUnitsGravsFromStars(units, unitIndexPlanetTraversal, massiveBodiesFrame.getStarsFrame(), stars)
    .forEach((onUnitGravs, i) => {
      const onUnit = units[i];
      if (onUnit.getBodyFrame().isNotDestroyed() && !unitIndexPlanetTraversal.has(i)) {
        onUnitGravs.forEach((fromStarGrav) => {
          onUnit.getBodyFrame().getVelocity().add(fromStarGrav);
        });
      }
    });

  calcUnitsGravsFromPlanets(units, unitIndexPlanetTraversal, massiveBodiesFrame.getPlanetsFrame(), planets)
    .forEach((onUnitGravs, i) => {
      const onUnit = units[i];
      if (onUnit.getBodyFrame().isNotDestroyed() && !unitIndexPlanetTraversal.has(i)) {
        onUnitGravs.forEach((fromPlanetGrav) => {
          onUnit.getBodyFrame().getVelocity().add(fromPlanetGrav);
        });
      }
    });
};

const applyVelocityForEtherealBodies = (units, unitIndexPlanetTraversal) => {
  units
    .filter((unit, i) => unit.getBodyFrame().isNotDestroyed() && !unitIndexPlanetTraversal.has(i))
    .forEach((unit) => unit.getBodyFrame().getPosition().add(unit.getBodyFrame().getVelocity()));
};

const tickEtherealBodies = (units, planetsTraversals, unitIndexPlanetTraversal, stars, planets, asteroids, massiveBodiesFrame) => {
  unitIndexPlanetTraversal.forEach((planetTraversal, unitIndex) => {
    const maxSpeed = 200;
    const acc = 4;
    const decel = 2;

    const unit = units[unitIndex];
    const unitBodyFrame = unit.getBodyFrame();

    const planetIndex = planetTraversal.getPlanetIndex();
    const planet = planets[planetIndex];
    const planetBodyFrame = massiveBodiesFrame.getPlanetsFrame()[planetIndex];

    if (planetTraversal.hasRequestedDirection()) {
      planetTraversal.addSpeed(acc, planetTraversal.getRequestedDirection(), maxSpeed);
    }
    else {
      if (planetTraversal.getSpeed() > 0) {
        planetTraversal.decreaseSpeed(decel)
      }
    }

    if (planetTraversal.hasDirection()) {
      if (planetTraversal.isDirectionClockwise()) {
        const radians = (planetTraversal.getRadians() + (planetTraversal.getSpeed() / (planet.getRadius() * 100))) % (Math.PI * 2);
        planetTraversal.setRadians(radians);
      }
      else if (planetTraversal.isDirectionCounterClockwise()) {
        const radians = (planetTraversal.getRadians() - (planetTraversal.getSpeed() / (planet.getRadius() * 100))) % (Math.PI * 2);
        planetTraversal.setRadians(radians);
      }
    }

    planetTraversal.setRadians(planetTraversal.getRadians() + planetBodyFrame.getRotation());

    const unitPosition = unitBodyFrame.getPosition();
    const planetPosition = planetBodyFrame.getPosition();
    unitPosition.setX(planetPosition.getX() + (Math.cos(planetTraversal.getRadians()) * (planet.getRadius() + (unit.getRadius() * 2))));
    unitPosition.setZ(planetPosition.getZ() + (Math.sin(planetTraversal.getRadians()) * (planet.getRadius() + (unit.getRadius() * 2))));
    unitBodyFrame.setOrientation(planetTraversal.getRadians());
  });

  applyGravityForEtherealBodies(units, unitIndexPlanetTraversal, stars, planets, asteroids, massiveBodiesFrame);
  applyVelocityForEtherealBodies(units, unitIndexPlanetTraversal);

};

const handleEtherealBodiesCollisions = (units, planetsTraversals, unitIndexPlanetTraversal, unitDestroys, massiveBodiesFrame, stars, planets, asteroids) => {
  const unitsCollisionsFromStars = calcUnitsCollisionsFromStars(units, massiveBodiesFrame.getStarsFrame(), stars);
  const allUnitsCollisionsFromPlanets = calcUnitsCollisionsFromPlanets(units, unitIndexPlanetTraversal, massiveBodiesFrame.getPlanetsFrame(), planets);
  const unitsCollisionsFromAsteroids = calcUnitsCollisionsFromAsteroids(units, massiveBodiesFrame.getAsteroidsFrame(), asteroids);
  const unitsCollisions = calcUnitsCollisions(units);

  const unitsCollisionsFromPlanets = new Map();
  const newUnitIndexPlanetTraversal = new Map();
  allUnitsCollisionsFromPlanets.forEach((planetIndexes, unitIndex) => {
    if (unitIndexPlanetTraversal.has(unitIndex)) {
      unitsCollisionsFromPlanets.set(unitIndex, planetIndexes);
    }
    else {
      const planetIndex = planetIndexes[0]; // if floating unit collided with multiple planets just pick the first one
      const planet = planets[planetIndex];
      const planetPosition = massiveBodiesFrame.getPlanetsFrame()[planetIndex].getPosition();
      const unit = units[unitIndex];
      const unitPosition = unit.getBodyFrame().getPosition();

      const radians = Math.atan2(unitPosition.getZ() - planetPosition.getZ(), unitPosition.getX() - planetPosition.getX());

      const planetTraversal = PlanetTraversal(unitIndex, planetIndex, radians);

      unitIndexPlanetTraversal.set(unitIndex, planetTraversal);
      newUnitIndexPlanetTraversal.set(unitIndex, planetTraversal);
      planetsTraversals[planetIndex].add(unitIndex);

      unitPosition.setXyz(
        planetPosition.getX() + (Math.cos(radians) * (planet.getRadius() + (unit.getRadius() * 2))),
        0,
        planetPosition.getZ() + (Math.sin(radians) * (planet.getRadius() + (unit.getRadius() * 2)))
      );
    }
  });

  const unitsOutOfBounds = new Set();
  units.forEach((unit, i) => {
    const unitBodyFrame = unit.getBodyFrame();
    const unitPosition = unitBodyFrame.getPosition();

    if (unitBodyFrame.isNotDestroyed() &&
        (unitPosition.getX() > (INSCRIBED_SQUARE_SIDE_LENGTH - unit.getRadius()) || unitPosition.getX() < (-INSCRIBED_SQUARE_SIDE_LENGTH + unit.getRadius()) ||
         unitPosition.getZ() > (INSCRIBED_SQUARE_SIDE_LENGTH - unit.getRadius()) || unitPosition.getZ() < (-INSCRIBED_SQUARE_SIDE_LENGTH + unit.getRadius()))) {

      const distance = Math.sqrt(unitPosition.getX() ** 2 + unitPosition.getZ() ** 2);

      if (distance > (config.getMaxDist() - unit.getRadius())) {
        unitsOutOfBounds.add(i);
      }
    }
  });

  const newDestroyedUnitIndexes = [];
  massiveBodiesFrame.getNewDestroyedPlanetIndexes().forEach((newDestroyedPlanetIndex) => {
    const planetTraversals = planetsTraversals[newDestroyedPlanetIndex];
    planetTraversals.forEach((unitIndex) => newDestroyedUnitIndexes.push(unitIndex));
  });
  Array
    .from(unitsOutOfBounds)
    .filter(unitIndex => !unitDestroys.has(unitIndex) && !newDestroyedUnitIndexes.includes(unitIndex))
    .forEach(unitIndex => newDestroyedUnitIndexes.push(unitIndex));
  Array
    .from(unitsCollisionsFromStars.keys())
    .filter(onUnitIndex => !unitDestroys.has(onUnitIndex) && !newDestroyedUnitIndexes.includes(onUnitIndex))
    .forEach(onUnitIndex => newDestroyedUnitIndexes.push(onUnitIndex));
  Array
    .from(unitsCollisionsFromPlanets.keys())
    .filter(onUnitIndex => !unitDestroys.has(onUnitIndex) && !newDestroyedUnitIndexes.includes(onUnitIndex))
    .forEach(onUnitIndex => newDestroyedUnitIndexes.push(onUnitIndex));
  Array
    .from(unitsCollisionsFromAsteroids.keys())
    .filter(onUnitIndex => !unitDestroys.has(onUnitIndex) && !newDestroyedUnitIndexes.includes(onUnitIndex))
    .forEach(onUnitIndex => newDestroyedUnitIndexes.push(onUnitIndex));
  Array
    .from(unitsCollisions.keys())
    .filter(onUnitIndex => !unitDestroys.has(onUnitIndex) && !newDestroyedUnitIndexes.includes(onUnitIndex))
    .forEach(onUnitIndex => newDestroyedUnitIndexes.push(onUnitIndex));

  const newDestroyedUnitIndexPlanetTraversal = new Map();

  newDestroyedUnitIndexes.forEach((newDestroyedUnitIndex) => {
    const unit = units[newDestroyedUnitIndex];
    unit.getBodyFrame().destroy();
    unitDestroys.add(newDestroyedUnitIndex);
    if (unitIndexPlanetTraversal.has(newDestroyedUnitIndex)) {
      const planetTraversal = unitIndexPlanetTraversal.get(newDestroyedUnitIndex);
      newDestroyedUnitIndexPlanetTraversal.set(newDestroyedUnitIndex, planetTraversal);
      const planetIndex = planetTraversal.getPlanetIndex();
      unitIndexPlanetTraversal.delete(newDestroyedUnitIndex);
      planetsTraversals[planetIndex].delete(newDestroyedUnitIndex);
    }
  });

  return EtherealBodiesCollisions(
    unitDestroys, newDestroyedUnitIndexes, newUnitIndexPlanetTraversal, newDestroyedUnitIndexPlanetTraversal,
    unitsCollisionsFromStars, allUnitsCollisionsFromPlanets,
    unitsCollisionsFromPlanets, unitsCollisionsFromAsteroids,
    unitsCollisions, unitsOutOfBounds
  );
};

const handleMassiveBodiesCollisions = (second, tick, stars, planets, asteroids, planetDestroys, asteroidDestroys) => {
  const planetsCollisionsFromStars = calcPlanetsCollisionsFromStars(planets, stars);
  const planetsCollisions = calcPlanetsCollisions(planets);
  const asteroidsCollisionsFromStars = calcAsteroidsCollisionsFromStars(asteroids, stars);
  const asteroidsCollisionsFromPlanets = calcAsteroidsCollisionsFromPlanets(asteroids, planets);
  const asteroidsCollisions = calcAsteroidsCollisions(asteroids);

  const planetsOutOfBounds = new Set();
  planets.forEach((planet, i) => {
    const planetBodyFrame = planet.getBodyFrame();
    const planetPosition = planetBodyFrame.getPosition();

    if (planetBodyFrame.isNotDestroyed() &&
        (planetPosition.getX() > (INSCRIBED_SQUARE_SIDE_LENGTH - planet.getRadius()) || planetPosition.getX() < (-INSCRIBED_SQUARE_SIDE_LENGTH + planet.getRadius()) ||
         planetPosition.getZ() > (INSCRIBED_SQUARE_SIDE_LENGTH - planet.getRadius()) || planetPosition.getZ() < (-INSCRIBED_SQUARE_SIDE_LENGTH + planet.getRadius()))) {

      const distance = Math.sqrt(planetPosition.getX() ** 2 + planetPosition.getZ() ** 2);

      if (distance > (config.getMaxDist() - planet.getRadius())) {
        planetsOutOfBounds.add(i);
      }
    }
  });
  const asteroidsOutOfBounds = new Set();
  asteroids.forEach((asteroid, i) => {
    const asteroidBodyFrame = asteroid.getBodyFrame();
    const asteroidPosition = asteroidBodyFrame.getPosition();

    if (asteroidBodyFrame.isNotDestroyed() &&
        (asteroidPosition.getX() > (INSCRIBED_SQUARE_SIDE_LENGTH - asteroid.getRadius()) || asteroidPosition.getX() < (-INSCRIBED_SQUARE_SIDE_LENGTH + asteroid.getRadius()) ||
         asteroidPosition.getZ() > (INSCRIBED_SQUARE_SIDE_LENGTH - asteroid.getRadius()) || asteroidPosition.getZ() < (-INSCRIBED_SQUARE_SIDE_LENGTH + asteroid.getRadius()))) {

      const distance = Math.sqrt(asteroidPosition.getX() ** 2 + asteroidPosition.getZ() ** 2);

      if (distance > (config.getMaxDist() - asteroid.getRadius())) {
        asteroidsOutOfBounds.add(i);
      }
    }
  });

  const newDestroyedPlanetIndexes = [];
  Array
    .from(planetsOutOfBounds)
    .filter(planetIndex => !planetDestroys.has(planetIndex) && !newDestroyedPlanetIndexes.includes(planetIndex))
    .forEach(planetIndex => newDestroyedPlanetIndexes.push(planetIndex));
  Array
      .from(planetsCollisionsFromStars.keys())
      .filter(onPlanetIndex => !planetDestroys.has(onPlanetIndex) && !newDestroyedPlanetIndexes.includes(onPlanetIndex))
      .forEach(onPlanetIndex => newDestroyedPlanetIndexes.push(onPlanetIndex));
  Array
      .from(planetsCollisions.keys())
      .filter(onPlanetIndex => !planetDestroys.has(onPlanetIndex) && !newDestroyedPlanetIndexes.includes(onPlanetIndex))
      .forEach(onPlanetIndex => newDestroyedPlanetIndexes.push(onPlanetIndex));

  const newDestroyedAsteroidIndexes = [];
  Array
    .from(asteroidsOutOfBounds)
    .filter(asteroidIndex => !asteroidDestroys.has(asteroidIndex) && !newDestroyedAsteroidIndexes.includes(asteroidIndex))
    .forEach(asteroidIndex => newDestroyedAsteroidIndexes.push(asteroidIndex));
  Array
      .from(asteroidsCollisionsFromStars.keys())
      .filter(onAsteroidIndex => !asteroidDestroys.has(onAsteroidIndex) && !newDestroyedAsteroidIndexes.includes(onAsteroidIndex))
      .forEach(onAsteroidIndex => newDestroyedAsteroidIndexes.push(onAsteroidIndex));
  Array
      .from(asteroidsCollisionsFromPlanets.keys())
      .filter(onAsteroidIndex => !asteroidDestroys.has(onAsteroidIndex) && !newDestroyedAsteroidIndexes.includes(onAsteroidIndex))
      .forEach(onAsteroidIndex => newDestroyedAsteroidIndexes.push(onAsteroidIndex));
  Array
      .from(asteroidsCollisions.keys())
      .filter(onAsteroidIndex => !asteroidDestroys.has(onAsteroidIndex) && !newDestroyedAsteroidIndexes.includes(onAsteroidIndex))
      .forEach(onAsteroidIndex => newDestroyedAsteroidIndexes.push(onAsteroidIndex));

  const newDestroyedPlanetPlanetDestroys = [];
  newDestroyedPlanetIndexes.forEach((newDestroyedPlanetIndex) => {
    const planet = planets[newDestroyedPlanetIndex];
    planet.getBodyFrame().destroy();
    const ticksToRespawn =
      Math.floor(Math.random() * (config.getPlanetRespawnTicksMax() - config.getPlanetRespawnTicksMin() + 1)) +
      config.getPlanetRespawnTicksMin();
    const planetDestroy = BodyDestroy(
        newDestroyedPlanetIndex,
        second,
        tick,
        ticksToRespawn,
        planet.getBodyFrame().copyOf(),
        planetsStartingBodyFrames[Math.trunc(Math.random() * planetsStartingBodyFrames.length)].copyOf()
    );
    planetDestroys.set(newDestroyedPlanetIndex, planetDestroy);
    newDestroyedPlanetPlanetDestroys.push(planetDestroy);
  });

  const newSpawnPlanetIndexes = [];
  planetDestroys.forEach((planetDestroy, destroyedPlanetIndex) => {
    const ticksSince = ((second - planetDestroy.getSecond()) * config.getTicksPerSecond()) + tick;
    if (ticksSince >= planetDestroy.getTicksToRespawn()) {
      newSpawnPlanetIndexes.push(destroyedPlanetIndex);
    }
  });

  const newDestroyedAsteroidAsteroidDestroys = [];
  newDestroyedAsteroidIndexes.forEach((newDestroyedAsteroidIndex) => {
    const asteroid = asteroids[newDestroyedAsteroidIndex];
    asteroid.getBodyFrame().destroy();
    const ticksToRespawn =
        Math.floor(Math.random() * (config.getAsteroidRespawnTicksMax() - config.getAsteroidRespawnTicksMin() + 1)) +
        config.getAsteroidRespawnTicksMin();
    const asteroidDestroy = BodyDestroy(
        newDestroyedAsteroidIndex,
        second,
        tick,
        ticksToRespawn,
        asteroid.getBodyFrame().copyOf(),
        asteroidsStartingBodyFrames[Math.trunc(Math.random() * asteroidsStartingBodyFrames.length)].copyOf()
    );
    asteroidDestroys.set(newDestroyedAsteroidIndex, asteroidDestroy);
    newDestroyedAsteroidAsteroidDestroys.push(asteroidDestroy);
  });

  const newSpawnAsteroidIndexes = [];
  asteroidDestroys.forEach((asteroidDestroy, destroyedAsteroidIndex) => {
    const ticksSince = ((second - asteroidDestroy.getSecond()) * config.getTicksPerSecond()) + tick;
    if (ticksSince >= asteroidDestroy.getTicksToRespawn()) {
      newSpawnAsteroidIndexes.push(destroyedAsteroidIndex);
    }
  });

  if (newDestroyedPlanetPlanetDestroys.length > 0 || newSpawnPlanetIndexes.length > 0 ||
      newDestroyedAsteroidAsteroidDestroys.length > 0 || newSpawnAsteroidIndexes.length > 0) {
    const newPlanetSpawns = new Map();
    const newAsteroidSpawns = new Map();
    if (newSpawnPlanetIndexes.length > 0) {
      newSpawnPlanetIndexes.forEach(spawnPlanetIndex => {
        const planetDestroy = planetDestroys.get(spawnPlanetIndex);
        const planetSpawn = BodySpawn(spawnPlanetIndex, second, tick, planetDestroy.getRespawnBodyFrame());
        planetDestroys.delete(spawnPlanetIndex);
        newPlanetSpawns.set(spawnPlanetIndex, planetSpawn);
        planets[spawnPlanetIndex].getBodyFrame().set(planetSpawn.getSpawnBodyFrame());
      });
    }
    if (newSpawnAsteroidIndexes.length > 0) {
      newSpawnAsteroidIndexes.forEach(spawnAsteroidIndex => {
        const asteroidDestroy = asteroidDestroys.get(spawnAsteroidIndex);
        const asteroidSpawn = BodySpawn(spawnAsteroidIndex, second, tick, asteroidDestroy.getRespawnBodyFrame());
        asteroidDestroys.delete(spawnAsteroidIndex);
        newAsteroidSpawns.set(spawnAsteroidIndex, asteroidSpawn);
        asteroids[spawnAsteroidIndex].getBodyFrame().set(asteroidSpawn.getSpawnBodyFrame());
      });
    }

    return MassiveBodiesFrame.copyFrom(stars, planets, asteroids,
                                       planetDestroys, asteroidDestroys,
                                       newPlanetSpawns, newAsteroidSpawns,
                                       newDestroyedPlanetIndexes, newDestroyedAsteroidIndexes);
  }
  else {
    return MassiveBodiesFrame.copyFrom(stars, planets, asteroids, planetDestroys, asteroidDestroys);
  }
};


export {
  getInscribedSquareSideLength,
  calcGravOnBodyFromBody, calcGravOnPositionFromMassFromPosition,
  calcPlanetsGravsFromStars, calcAsteroidsGravsFromStars, calcUnitsGravsFromStars,
  calcPlanetsGravs, calcAsteroidsGravsFromPlanets, calcUnitsGravsFromPlanets,
  calcPlanetsCollisionsFromStars, calcAsteroidsCollisionsFromStars, calcUnitsCollisionsFromStars,
  calcPlanetsCollisions, calcAsteroidsCollisionsFromPlanets, calcUnitsCollisionsFromPlanets,
  calcAsteroidsCollisions, calcUnitsCollisionsFromAsteroids, calcUnitsCollisions,
  applyGravityForMassiveBodies, applyVelocityForMassiveBodies, tickMassiveBodies, handleMassiveBodiesCollisions,
  applyGravityForEtherealBodies, applyVelocityForEtherealBodies, tickEtherealBodies, handleEtherealBodiesCollisions
};
