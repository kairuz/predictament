const Vec3 = (_x, _y, _z) => {
  let x = _x;
  let y = _y;
  let z = _z;

  const addXyz = (_x, _y, _z) => {x += _x; y += _y; z += _z;};
  const add = (_vec3) => addXyz(_vec3.getX(), _vec3.getY(), _vec3.getZ());

  const mulXyz = (_x, _y, _z) => {x *= _x; y *= _y; z *= _z;};
  const mul = (_vec3) => mulXyz(_vec3.getX(), _vec3.getY(), _vec3.getZ());
  const mulScalar = (_scalar) => mulXyz(_scalar, _scalar, _scalar);

  const thiz = {
    toString: () => `[${x},${y},${z}]`,
    toPrettyStr: () => `[${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}]`,
    setX: (_x) => x = _x,
    setY: (_y) => y = _y,
    setZ: (_z) => z = _z,
    setXyz: (_x, _y, _z) => {x = _x; y = _y; z = _z;},
    set: (_vec3) => {x = _vec3.getX(); y = _vec3.getY(); z = _vec3.getZ();},
    setFromArr: (_arr) => {x = _arr[0]; y = _arr[1]; z = _arr[2];},
    getX: () => x,
    getY: () => y,
    getZ: () => z,
    addXyz,
    addXyzAndGet: (_x, _y, _z) => {addXyz(_z, _y, _z);return thiz;},
    add,
    addAndGet: (_vec3) => {add(_vec3);return thiz;},
    sub: (_vec3) => {x -= _vec3.getX(); y -= _vec3.getY(); z -= _vec3.getZ();},
    addX: (_n) => x += _n,
    addY: (_n) => y += _n,
    addZ: (_n) => z += _n,
    diff: (_vec3) => Vec3(x - _vec3.getX(), y - _vec3.getY(), z -_vec3.getZ()),
    mulXyz,
    mul,
    mulScalar,
    mulScalarAndGet: (_scalar) => {mulScalar(_scalar);return thiz;},
    mulXyzAndGet: (_x, _y, _z) => {mulXyz(_x, _y, _z);return thiz},
    mulAndGet: (_vec3) => {mul(_vec3);return thiz},
    pow: (_n) => Vec3(Math.pow(x, _n), Math.pow(y, _n), Math.pow(z, _n)),
    sq: function(){return this.pow(2);},
    toInv: () => Vec3(-x, -y, -z),
    setInv: () => {x = -x; y = -y; z = -z;},
    equals: (_vec3) => x === _vec3.getX() && y === _vec3.getY() && z === _vec3.getZ(),
    copyOf: () => Vec3(x, y, z),
    toArr: () => [x, y, z]
  };

  return thiz;
};
Vec3.copyOf = (_vec3) => _vec3.copyOf();
Vec3.fromArr = (_vec3Arr) => Vec3(_vec3Arr[0], _vec3Arr[1], _vec3Arr[2]);
Vec3.toArr = (_vec3) => _vec3.toArr();
Vec3.zero = () => Vec3(0, 0, 0);
const _Vec3_zero = Vec3.zero();
Vec3.zeroArr = () => _Vec3_zero.toArr();

const BodyFrame = (_position = Vec3.zero(),
                   _velocity = Vec3.zero(),
                   _orientation = 0,
                   _rotation = 0,
                   _destroyed = false) => {
  const position = _position;
  const velocity = _velocity;
  let orientation = _orientation;
  let rotation = _rotation;
  let destroyed = _destroyed;

  const orient = (_radians) => {
    orientation = _radians;
  };

  const rotate = () => {
    orient(orientation + rotation);
  };

  return {
    orient,
    rotate,
    set: (_bodyFrame) => {
      position.set(_bodyFrame.getPosition());
      velocity.set(_bodyFrame.getVelocity());
      orientation = _bodyFrame.getOrientation();
      rotation = _bodyFrame.getRotation();
      destroyed = _bodyFrame.getDestroyed();
    },
    getPosition: () => position,
    getVelocity: () => velocity,
    getOrientation: () => orientation,
    getRotation: () => rotation,
    setOrientation: (_orientation) => orientation = _orientation,
    setRotation: (_rotation) => rotation = _rotation,
    setDestroyed: (_destroyed) => destroyed = _destroyed,
    setDestroyedAndGet: function(_destroyed) {
      destroyed = _destroyed;
      return this;
    },
    getDestroyed: () => destroyed,
    destroy: () => destroyed = true,
    destroyAndGet: function() {
      destroyed = true;
      return this;
    },
    spawnAtPosXyz: (_x, _y, _z) => {
      destroyed = false;
      position.setXyz(_x, _y, _z);
    },
    spawnAtPos: (_position) => {
      destroyed = false;
      position.set(_position);
    },
    spawn: () => destroyed = false,
    spawnAndGet: function() {
      destroyed = false;
      return this;
    },
    isDestroyed: () => destroyed,
    isNotDestroyed: () => !destroyed,
    toArr: () => [position.toArr(), velocity.toArr(), orientation, rotation, destroyed],
    toString: function(){return JSON.stringify(this.toArr());},
    toPrettyStr: () => `p=${position.toPrettyStr()},v=${velocity.toPrettyStr()}d=${destroyed}`,
    copyOf: function(){return BodyFrame.copyOf(this);} // swap impl from static to class
  };
};
BodyFrame.fromArr = (_arr) => {
  let ind = 0;
  return BodyFrame(
    Vec3.fromArr(_arr[ind++]), Vec3.fromArr(_arr[ind++]),
    _arr[ind++], _arr[ind++], _arr[ind++]
  );
};
BodyFrame.toArr = (_bodyFrame) => _bodyFrame.toArr();
BodyFrame.copyOf = (_bodyFrame) => BodyFrame(
  _bodyFrame.getPosition().copyOf(),
  _bodyFrame.getVelocity().copyOf(),
  _bodyFrame.getOrientation(),
  _bodyFrame.getRotation(),
  _bodyFrame.isDestroyed()
);
BodyFrame.zero = () => BodyFrame(Vec3.zero(), Vec3.zero(), 0, 0, false);
const _BodyFrame_zero_to_arr = BodyFrame.zero();
BodyFrame.zeroArr = () => _BodyFrame_zero_to_arr.toArr();

const Body = (_mass, _radius, _color, _bodyFrame) => {
  const mass = _mass;
  const radius = _radius;
  const color = _color;
  const bodyFrame = _bodyFrame;

  return {
    toString: () => `mass=${mass},rad=${radius},col=${color},bodyFrame=${bodyFrame}}`,
    toPrettyStr: () => `m=${mass},r=${radius},c=${color},bodyFrame=${bodyFrame.toPrettyStr()}`,
    getMass: () => mass,
    getRadius: () => radius,
    getColor: () => color,
    getBodyFrame: () => bodyFrame,
    toArr: () => [mass, radius, color, bodyFrame.toArr()]
  };
};
Body.fromArr = (_bodyArr) => Body(_bodyArr[0], _bodyArr[1], _bodyArr[2], BodyFrame.fromArr(_bodyArr[3]));
Body.toArr = (_body) => _body.toArr();


const MassiveBodiesFrame = (_starsFrame, _planetsFrame, _asteroidsFrame,
                            _planetDestroys = new Map(), _asteroidDestroys = new Map(),
                            _newPlanetSpawns = new Map(), _newAsteroidSpawns = new Map(),
                            _newDestroyedPlanetIndexes = [],_newDestroyedAsteroidIndexes = []) => {
  const starsFrame = _starsFrame;                                   // BodyFrame[]
  const planetsFrame = _planetsFrame;                               // BodyFrame[]
  const asteroidsFrame = _asteroidsFrame;                           // BodyFrame[]
  const planetDestroys = _planetDestroys;                           // Map<int, BodyDestroy>
  const asteroidDestroys = _asteroidDestroys;                       // Map<int, BodyDestroy>
  const newPlanetSpawns = _newPlanetSpawns;                         // Map<int, BodySpawn>
  const newAsteroidSpawns = _newAsteroidSpawns;                     // Map<int, BodySpawn>
  const newDestroyedPlanetIndexes = _newDestroyedPlanetIndexes;     // int[]
  const newDestroyedAsteroidIndexes = _newDestroyedAsteroidIndexes; // int[]

  return {
    getStarsFrame: () => starsFrame,
    getPlanetsFrame: () => planetsFrame,
    getAsteroidsFrame: () => asteroidsFrame,
    getPlanetDestroys: () => planetDestroys,
    getAsteroidDestroys: () => asteroidDestroys,
    getNewPlanetSpawns: () => newPlanetSpawns,
    getNewAsteroidSpawns: () => newAsteroidSpawns,
    getNewDestroyedPlanetIndexes: () => newDestroyedPlanetIndexes,
    getNewDestroyedAsteroidIndexes: () => newDestroyedAsteroidIndexes,
    toArr: () => [
      starsFrame.map(BodyFrame.toArr), planetsFrame.map(BodyFrame.toArr), asteroidsFrame.map(BodyFrame.toArr),
      Array.from(planetDestroys).map(entry => [entry[0], entry[1].toArr()]), Array.from(asteroidDestroys).map(entry => [entry[0], entry[1].toArr()]),
      Array.from(newPlanetSpawns).map(entry => [entry[0], entry[1].toArr()]), Array.from(newAsteroidSpawns).map(entry => [entry[0], entry[1].toArr()]),
      newDestroyedPlanetIndexes, newDestroyedAsteroidIndexes
    ],
    hasDiff: () => newPlanetSpawns.size !== 0 || newAsteroidSpawns.size !== 0 || newDestroyedPlanetIndexes.length !== 0 || newDestroyedAsteroidIndexes.length !== 0
  };
};
MassiveBodiesFrame.fromArr = (_arr) => {
  const planetDestroys = _arr[3].reduce((acc, curr) => acc.set(curr[0], BodyDestroy.fromArr(curr[1])), new Map());
  const asteroidDestroys = _arr[4].reduce((acc, curr) => acc.set(curr[0], BodyDestroy.fromArr(curr[1])), new Map());
  const newPlanetSpawns = _arr[5].reduce((acc, curr) => acc.set(curr[0], BodySpawn.fromArr(curr[1])), new Map());
  const newAsteroidSpawns = _arr[6].reduce((acc, curr) => acc.set(curr[0], BodySpawn.fromArr(curr[1])), new Map());
  return MassiveBodiesFrame(
    _arr[0].map(BodyFrame.fromArr), _arr[1].map(BodyFrame.fromArr), _arr[2].map(BodyFrame.fromArr),
    planetDestroys, asteroidDestroys, newPlanetSpawns, newAsteroidSpawns, _arr[7], _arr[8]
  );
};
MassiveBodiesFrame.toArr = (_massiveBodiesFrame) => _massiveBodiesFrame.toArr();
MassiveBodiesFrame.copyFrom = (_stars, _planets, _asteroids,
                               _planetDestroys, _asteroidDestroys,
                               _newPlanetSpawns = new Map(), _newAsteroidSpawns = new Map(),
                               _newDestroyedPlanetIndexes = [], _newDestroyedAsteroidIndexes = []) => {
  const starsFrame = _stars.map(star => star.getBodyFrame().copyOf());
  const planetsFrame = _planets.map((planet) => planet.getBodyFrame().copyOf());
  const asteroidsFrame = _asteroids.map((asteroid) => asteroid.getBodyFrame().copyOf());
  const planetDestroys = new Map();
  _planetDestroys.forEach((planetDestroy, planetIndex) => planetDestroys.set(planetIndex, planetDestroy.copyOf()));
  const asteroidDestroys = new Map();
  _asteroidDestroys.forEach((asteroidDestroy, asteroidIndex) => asteroidDestroys.set(asteroidIndex, asteroidDestroy.copyOf()));
  const newPlanetSpawns = new Map();
  _newPlanetSpawns.forEach((planetSpawn, planetIndex) => newPlanetSpawns.set(planetIndex, planetSpawn.copyOf()));
  const newAsteroidSpawns = new Map();
  _newAsteroidSpawns.forEach((asteroidSpawn, asteroidIndex) => newAsteroidSpawns.set(asteroidIndex, asteroidSpawn.copyOf()));
  const newDestroyedPlanetIndexes = [..._newDestroyedPlanetIndexes];
  const newDestroyedAsteroidIndexes = [..._newDestroyedAsteroidIndexes];

  return MassiveBodiesFrame(
    starsFrame, planetsFrame, asteroidsFrame,
    planetDestroys, asteroidDestroys,
    newPlanetSpawns, newAsteroidSpawns,
    newDestroyedPlanetIndexes, newDestroyedAsteroidIndexes
  );
};


const BodyDestroy = (_bodyIndex, _second, _tick, _ticksToRespawn, _destroyBodyFrame, _respawnBodyFrame) => {
  const bodyIndex = _bodyIndex;
  const second = _second;
  const tick = _tick;
  const ticksToRespawn = _ticksToRespawn;
  const destroyBodyFrame = _destroyBodyFrame;
  const respawnBodyFrame = _respawnBodyFrame;

  return {
    getBodyIndex: () => bodyIndex,
    getSecond: () => second,
    getTick: () => tick,
    getTicksToRespawn: () => ticksToRespawn,
    getDestroyBodyFrame: () => destroyBodyFrame,
    getRespawnBodyFrame: () => respawnBodyFrame,
    copyOf: () => BodyDestroy(bodyIndex, second, tick, ticksToRespawn, destroyBodyFrame.copyOf(), respawnBodyFrame.copyOf()),
    toArr: () => [bodyIndex, second, tick, ticksToRespawn, destroyBodyFrame.toArr(), respawnBodyFrame.toArr()]
  };
};
BodyDestroy.fromArr = (_arr) => BodyDestroy(_arr[0], _arr[1], _arr[2], _arr[3], BodyFrame.fromArr(_arr[4]), BodyFrame.fromArr(_arr[5]));
BodyDestroy.toArr = (_bodyDestroy) => _bodyDestroy.toArr();
BodyDestroy.copyOf = (_bodyDestroy) => _bodyDestroy.copyOf();

const BodySpawn = (_bodyIndex, _second, _tick, _spawnBodyFrame) => {
  const bodyIndex = _bodyIndex;
  const second = _second;
  const tick = _tick;
  const spawnBodyFrame = _spawnBodyFrame;

  return {
    getBodyIndex: () => bodyIndex,
    getSecond: () => second,
    getTick: () => tick,
    getSpawnBodyFrame: () => spawnBodyFrame,
    copyOf: () => BodySpawn(bodyIndex, second, tick, spawnBodyFrame.copyOf()),
    toArr: () => [bodyIndex, second, tick, spawnBodyFrame.toArr()]
  };
};
BodySpawn.fromArr = (_arr) => BodySpawn(_arr[0], _arr[1], _arr[2], BodyFrame.fromArr(_arr[3]));
BodySpawn.toArr = (_bodySpawn) => _bodySpawn.toArr();
BodySpawn.copyOf = (_bodySpawn) => _bodySpawn.copyOf();


const FramesNode = (_second, _massiveBodiesFrames, _offset) => {
  const second = _second;
  const massiveBodiesFrames = _massiveBodiesFrames; // MassiveBodiesFrame[]
  const offset = _offset;

  return {
    getSecond: () => second,
    getMassiveBodiesFrames: () => massiveBodiesFrames,
    getOffset: () => offset,
    toArr: () => [second, massiveBodiesFrames.map(MassiveBodiesFrame.toArr), offset],
    toString: () => `sec=${second},massiveBodiesFrames.len=${massiveBodiesFrames.length},offset=${offset}`
  };
};
FramesNode.fromArr = (_framesNodeArr) => FramesNode(_framesNodeArr[0], _framesNodeArr[1].map(MassiveBodiesFrame.fromArr), _framesNodeArr[2]);
FramesNode.toArr = (_framesNode) => _framesNode.toArr();


const FrameDiffNode = (_ordinal, _second, _tick, _massiveBodiesFrame) => {
  const ordinal = _ordinal;
  const second = _second;
  const tick = _tick;
  const massiveBodiesFrame = _massiveBodiesFrame;

  return {
    getOrdinal: () => ordinal,
    getSecond: () => second,
    getTick: () => tick,
    getMassiveBodiesFrame: () => massiveBodiesFrame,
    toArr: () =>[
      ordinal, second, tick, MassiveBodiesFrame.toArr(massiveBodiesFrame)
    ],
    toString: () =>
      `ordinal=${ordinal},second=${second},tick=${tick},massiveBodiesFrame=${massiveBodiesFrame}`
  };
};
FrameDiffNode.fromArr = (_arr) => FrameDiffNode(_arr[0], _arr[1], _arr[2], MassiveBodiesFrame.fromArr(_arr[3]));
FrameDiffNode.toArr = (_frameDiffNode) => _frameDiffNode.toArr();

const TraversalDirection = () => {};
TraversalDirection.NONE = 0;
TraversalDirection.CLOCKWISE = 1;
TraversalDirection.COUNTERCLOCKWISE = 2;
TraversalDirection.isNone = (_traversalDirection) => _traversalDirection === TraversalDirection.NONE;
TraversalDirection.isNotNone = (_traversalDirection) => !TraversalDirection.isNone();
TraversalDirection.isClockwise = (_traversalDirection) => _traversalDirection === TraversalDirection.CLOCKWISE;
TraversalDirection.isCounterClockwise = (_traversalDirection) => _traversalDirection === TraversalDirection.COUNTERCLOCKWISE;
TraversalDirection.hasDirection = (_traversalDirection) => TraversalDirection.isClockwise(_traversalDirection) || TraversalDirection.isCounterClockwise(_traversalDirection);


const PlanetTraversal = (_unitIndex, _planetIndex, _radians, _speed = 0, _direction = TraversalDirection.NONE, _requestedDirection = TraversalDirection.NONE) => {
  const unitIndex = _unitIndex;
  const planetIndex = _planetIndex;
  let radians = _radians;
  let speed = _speed;
  let direction = _direction;
  let requestedDirection = _requestedDirection;

  const addSpeed = (_amount, _direction, _maxSpeed) => {
    if (TraversalDirection.isNone(direction) || _direction === direction) {
      if (TraversalDirection.isNone(direction)) {
        direction = _direction;
      }
      speed += _amount;
    }
    else {
      speed -= _amount;
    }

    if (speed > _maxSpeed) {
      speed = _maxSpeed;
    }
    if (speed < 0) {
      speed = 0;
    }
    if (speed === 0) {
      direction = TraversalDirection.NONE;
    }
  };

  const decreaseSpeed = (_amount) => {
    speed -= _amount;
    if (speed < 0) {
      speed = 0;
    }
    if (speed === 0) {
      direction = TraversalDirection.NONE;
    }
  };

  return {
    setRadians: (_radians) => radians = _radians,
    addSpeed,
    decreaseSpeed,
    setDirection: (_direction) => direction = _direction,
    setRequestedDirection: (_requestedDirection) => requestedDirection = _requestedDirection,
    requestClockwise: () => requestedDirection = TraversalDirection.CLOCKWISE,
    requestCounterClockwise: () => requestedDirection = TraversalDirection.COUNTERCLOCKWISE,
    getUnitIndex: () => unitIndex,
    getPlanetIndex: () => planetIndex,
    getRadians: () => radians,
    getSpeed: () => speed,
    getDirection: () => direction,
    getRequestedDirection: () => requestedDirection,
    hasDirection: () => TraversalDirection.hasDirection(direction),
    isDirectionNone: () => TraversalDirection.isNone(direction),
    isDirectionClockwise: () => TraversalDirection.isClockwise(direction),
    isDirectionCounterClockwise: () => TraversalDirection.isCounterClockwise(direction),
    hasRequestedDirection: () => TraversalDirection.hasDirection(requestedDirection),
    isRequestedDirectionNone: () => TraversalDirection.isNone(requestedDirection),
    isRequestedDirectionClockwise: () => TraversalDirection.isClockwise(requestedDirection),
    isRequestedDirectionCounterClockwise: () => TraversalDirection.isCounterClockwise(requestedDirection),
    toArr: () => [unitIndex, planetIndex, radians, speed, direction, requestedDirection]
  }
};
PlanetTraversal.fromArr = (_arr) => {
  let ind = 0;
  return PlanetTraversal(_arr[ind++], _arr[ind++], _arr[ind++], _arr[ind++], _arr[ind++], _arr[ind++]);
};
PlanetTraversal.toArr = (_planetTraversal) => _planetTraversal.toArr();


const EtherealBodiesCollisions = (
  _unitDestroys, _newDestroyedUnitIndexes, _newUnitIndexPlanetTraversal, _newDestroyedUnitIndexPlanetTraversal,
  _unitsCollisionsFromStars = new Map(), _allUnitsCollisionsFromPlanets = new Map(),
  _unitsCollisionsFromPlanets = new Map(), _unitsCollisionsFromAsteroids = new Map(),
  _unitsCollisions = new Map(), _unitsOutOfBounds = new Set()
) => {
  const unitDestroys = _unitDestroys;
  const newDestroyedUnitIndexes = _newDestroyedUnitIndexes;
  const newUnitIndexPlanetTraversal = _newUnitIndexPlanetTraversal;
  const newDestroyedUnitIndexPlanetTraversal = _newDestroyedUnitIndexPlanetTraversal;
  const unitsCollisionsFromStars = _unitsCollisionsFromStars;
  const allUnitsCollisionsFromPlanets = _allUnitsCollisionsFromPlanets;
  const unitsCollisionsFromPlanets = _unitsCollisionsFromPlanets;
  const unitsCollisionsFromAsteroids = _unitsCollisionsFromAsteroids;
  const unitsCollisions = _unitsCollisions;
  const unitsOutOfBounds = _unitsOutOfBounds;
  return {
    hasAnyNew: () => newDestroyedUnitIndexes.length > 0 || newUnitIndexPlanetTraversal.size > 0 || newDestroyedUnitIndexPlanetTraversal.size > 0 ||
                     Array.from(unitsCollisionsFromStars).some((bodyIndexes) => bodyIndexes.length > 0) ||
                     Array.from(allUnitsCollisionsFromPlanets).some((bodyIndexes) => bodyIndexes.length > 0) ||
                     Array.from(unitsCollisionsFromPlanets).some((bodyIndexes) => bodyIndexes.length > 0) ||
                     Array.from(unitsCollisionsFromAsteroids).some((bodyIndexes) => bodyIndexes.length > 0) ||
                     Array.from(unitsCollisions).some((bodyIndexes) => bodyIndexes.length > 0) ||
                     unitsOutOfBounds.size > 0,
    getUnitDestroys: () => unitDestroys,
    getNewDestroyedUnitIndexes: () => newDestroyedUnitIndexes,
    getNewUnitIndexPlanetTraversal: () => newUnitIndexPlanetTraversal,
    getNewDestroyedUnitIndexPlanetTraversal: () => newDestroyedUnitIndexPlanetTraversal,
    getUnitsCollisionsFromStars: () => unitsCollisionsFromStars,
    getAllUnitsCollisionsFromPlanets: () => allUnitsCollisionsFromPlanets,
    getUnitsCollisionsFromPlanets: () => unitsCollisionsFromPlanets,
    getUnitsCollisionsFromAsteroids: () => unitsCollisionsFromAsteroids,
    getUnitsCollisions: () => unitsCollisions,
    getUnitsOutOfBounds: () => unitsOutOfBounds,

    toArr: () => [
      Array.from(unitDestroys),
      [...newDestroyedUnitIndexes],
      Array.from(newUnitIndexPlanetTraversal).map((entry) => [entry[0], entry[1].toArr()]),
      Array.from(newDestroyedUnitIndexPlanetTraversal).map((entry) => [entry[0], entry[1].toArr()]),
      Array.from(unitsCollisionsFromStars).map((entry) => [entry[0], entry[1]]),
      Array.from(allUnitsCollisionsFromPlanets).map((entry) => [entry[0], entry[1]]),
      Array.from(unitsCollisionsFromPlanets).map((entry) => [entry[0], entry[1]]),
      Array.from(unitsCollisionsFromAsteroids).map((entry) => [entry[0], entry[1]]),
      Array.from(unitsCollisions).map((entry) => [entry[0], entry[1]]),
      Array.from(unitsOutOfBounds)
    ]
  }
};

EtherealBodiesCollisions.toArr = (_etherealBodiesCollisions) => _etherealBodiesCollisions.toArr();
EtherealBodiesCollisions.fromArr = (_arr) => {
  let ind = 0;
  return EtherealBodiesCollisions(
    _arr[ind++].reduce((a, c) => a.add(c), new Set()),
    _arr[ind++],
    _arr[ind++].reduce((a, c) => a.set(c[0], PlanetTraversal.fromArr(c[1])), new Map()),
    _arr[ind++].reduce((a, c) => a.set(c[0], PlanetTraversal.fromArr(c[1])), new Map()),
    _arr[ind++].reduce((a, c) => a.set(c[0], c[1]), new Map()),
    _arr[ind++].reduce((a, c) => a.set(c[0], c[1]), new Map()),
    _arr[ind++].reduce((a, c) => a.set(c[0], c[1]), new Map()),
    _arr[ind++].reduce((a, c) => a.set(c[0], c[1]), new Map()),
    _arr[ind++].reduce((a, c) => a.set(c[0], c[1]), new Map()),
    _arr[ind++].reduce((a, c) => a.add(c), new Set())
  );
};

const Player = (_unitIndex, _unit, _planetTraversal = null) => {
  const unitIndex = _unitIndex;
  const unit = _unit;
  let planetTraversal = _planetTraversal;

  return {
    discardPlanetTraversal: () => {
      planetTraversal = null;
    },
    setPlanetTraversal: (_planetTraversal) => planetTraversal = _planetTraversal,
    getUnitIndex: () => unitIndex,
    getUnit: () => unit,
    getPlanetTraversal: () => planetTraversal
  };
};


export {
  Vec3, Body,
  BodyFrame, MassiveBodiesFrame,
  FramesNode, FrameDiffNode,
  BodyDestroy, BodySpawn,
  TraversalDirection, PlanetTraversal, EtherealBodiesCollisions,
  Player
};
