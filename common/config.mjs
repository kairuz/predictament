// const GAME_MILLISECOND = 0.1;
// const GAME_MILLISECOND = 0.5;
const GAME_MILLISECOND = 1;
// const GAME_MILLISECOND = 2;
// const GAME_MILLISECOND = 4;
// const GAME_MILLISECOND = 10;
// const GAME_MILLISECOND = 20;

// const TICKS_PER_SECOND = 4;
// const TICKS_PER_SECOND = 10;
// const TICKS_PER_SECOND = 20;
// const TICKS_PER_SECOND = 40;
const TICKS_PER_SECOND = 50;
// const TICKS_PER_SECOND = 60;
// const TICKS_PER_SECOND = 80;
// const TICKS_PER_SECOND = 100;
// const TICKS_PER_SECOND = 200;
const MOMENT_MILLIS = 1000 / TICKS_PER_SECOND;
// const BUFFER_MAX_SIZE = 5;

// const BUFFER_MAX_SIZE = 10;
// const BUFFER_MAX_SIZE = 20;
const BUFFER_MAX_SIZE = 30;
// const BUFFER_MAX_SIZE = 60;
// const BUFFER_MAX_SIZE = 300;
// const BUFFER_MAX_SIZE = 2000;
// const PLANET_RESPAWN_TICKS_MIN = (BUFFER_MAX_SIZE * TICKS_PER_SECOND) * 2;
const INITIAL_LOAD_SECONDS = Math.trunc(BUFFER_MAX_SIZE / 2);
// const INITIAL_LOAD_SECONDS = 5;
// const INITIAL_LOAD_SECONDS = 100;

const APPENDER_CHUNK_SIZE = Math.trunc(TICKS_PER_SECOND / 10);

const PLANET_RESPAWN_TICKS_MIN = TICKS_PER_SECOND * 5;
// const PLANET_RESPAWN_TICKS_MAX = (BUFFER_MAX_SIZE * TICKS_PER_SECOND) * 4;
const PLANET_RESPAWN_TICKS_MAX = TICKS_PER_SECOND * 10;
// const ASTEROID_RESPAWN_TICKS_MIN = (BUFFER_MAX_SIZE * TICKS_PER_SECOND) * 1;
const ASTEROID_RESPAWN_TICKS_MIN = TICKS_PER_SECOND * 3;
// const ASTEROID_RESPAWN_TICKS_MAX = (BUFFER_MAX_SIZE * TICKS_PER_SECOND) * 2;
const ASTEROID_RESPAWN_TICKS_MAX = TICKS_PER_SECOND * 6;
const UNIT_RESPAWN_TICKS_MIN = 2000;
const UNIT_RESPAWN_TICKS_MAX = 4000;
// const MAX_DIST = 400;
const MAX_DIST = 500;
// const MAX_DIST = 800;

// const GRAV_CONSTANT = 0.0000001;
const GRAV_CONSTANT = 0.0002;
// const GRAV_CONSTANT = 0.0003;


// const ORBIT_DRAW_INTERVAL = 10;
const ORBIT_DRAW_INTERVAL = Math.trunc(TICKS_PER_SECOND / 4);
// const ORBIT_DRAW_INTERVAL = Math.trunc(TICKS_PER_SECOND / 2);
// const ORBIT_DRAW_INTERVAL = TICKS_PER_SECOND;

const getGameMillisecond = () => GAME_MILLISECOND;
const getTicksPerSecond = () => TICKS_PER_SECOND;
const getMomentMillis = () => MOMENT_MILLIS;
const getInitialLoadSeconds = () => INITIAL_LOAD_SECONDS;
const getBufferMaxSize = () => BUFFER_MAX_SIZE;

const getAppenderChunkSize = () => APPENDER_CHUNK_SIZE;

const getPlanetRespawnTicksMin = () => PLANET_RESPAWN_TICKS_MIN;
const getPlanetRespawnTicksMax = () => PLANET_RESPAWN_TICKS_MAX;
const getAsteroidRespawnTicksMin = () => ASTEROID_RESPAWN_TICKS_MIN;
const getAsteroidRespawnTicksMax = () => ASTEROID_RESPAWN_TICKS_MAX;
const getUnitRespawnTicksMin = () => UNIT_RESPAWN_TICKS_MIN;
const getUnitRespawnTicksMax = () => UNIT_RESPAWN_TICKS_MAX;
const getMaxDist = () => MAX_DIST;

const getGravConstant = () => GRAV_CONSTANT;

const getOrbitDrawInterval = () => ORBIT_DRAW_INTERVAL;


export {
  getGameMillisecond,
  getTicksPerSecond, getMomentMillis,
  getInitialLoadSeconds, getBufferMaxSize,

  getAppenderChunkSize,

  getPlanetRespawnTicksMin, getPlanetRespawnTicksMax,
  getAsteroidRespawnTicksMin, getAsteroidRespawnTicksMax,
  getUnitRespawnTicksMin, getUnitRespawnTicksMax,
  getMaxDist,

  getGravConstant,

  getOrbitDrawInterval
};
