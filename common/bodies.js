import {Body, BodyFrame} from "./domain.js";


const stars = [
  Body.fromArr([100_000, 60, 'yellow', [[0, 0, 0], [0, 0, 0], 0, 0.01, false]]),
];

const planetsStartingBodyFrames = [
  BodyFrame.fromArr([[120, 0, -158.5], [0.357, 0, 0.217], 0, 0.005, false]),
  BodyFrame.fromArr([[-86, 0, 108], [-0.459, 0, -0.1215], 0, 0.008, false]),
  BodyFrame.fromArr([[96, 0, 148], [-0.359, 0, 0.2215], 0, 0.001, false]),
  BodyFrame.fromArr([[-186, 0, -96], [0.258, 0, -0.312], 0, 0.003, false]),
  BodyFrame.fromArr([[103, 0, 159], [-0.205, 0, 0.281], 0, 0.002, false]),
  BodyFrame.fromArr([[60, 0, 128.5], [-0.557, 0, 0.217], 0, 0.003, false]),
  BodyFrame.fromArr([[-106, 0, 128], [-0.459, 0, -0.1215], 0, 0.008, false]),
  BodyFrame.fromArr([[136, 0, 58], [-0.359, 0, 0.2215], 0, 0.002, false]),
  BodyFrame.fromArr([[-156, 0, 46], [-0.258, 0, -0.412], 0, 0.002, false]),
  BodyFrame.fromArr([[143, 0, 109], [-0.205, 0, 0.281], 0, 0.005, false])
];

const planets = [
  Body.fromArr([10_000, 25, 'chartreuse', BodyFrame.zeroArr()]),
  Body.fromArr([10_000, 25, 'cyan',       BodyFrame.zeroArr()]),
  Body.fromArr([10_000, 25, 'royalblue',  BodyFrame.zeroArr()]),
  Body.fromArr([10_000, 28, 'wheat',      BodyFrame.zeroArr()]),
  Body.fromArr([10_000, 28, 'lime',       BodyFrame.zeroArr()]),
  Body.fromArr([10_000, 28, 'green',      BodyFrame.zeroArr()]),
  Body.fromArr([10_000, 30, 'tan',        BodyFrame.zeroArr()]),
  Body.fromArr([10_000, 30, 'lightgreen', BodyFrame.zeroArr()])
];

const asteroidsStartingBodyFrames = [
  BodyFrame.fromArr([[-170, 0, -68.5], [0.2, 0, -0.317], 0, 0.09, false]),
  BodyFrame.fromArr([[-46, 0, 57], [-0.49, 0, -0.415], 0, 0.07, false]),
  BodyFrame.fromArr([[-50, 0, 38.5], [-0.51, 0, -0.517], 0, 0.05, false]),
  BodyFrame.fromArr([[-123, 0, 50], [-0.25, 0, -0.310], 0, 0.09, false])
  ,
  BodyFrame.fromArr([[40, 0, -38.5], [0.51, 0, 0.517], 0, 0.08, false]),
  BodyFrame.fromArr([[46, 0, -57], [0.49, 0, 0.415], 0, 0.05, false]),
  BodyFrame.fromArr([[106, 0, -69], [0.38, 0, 0.312], 0, 0.03, false]),
  BodyFrame.fromArr([[123, 0, -50], [0.25, 0, 0.310], 0, 0.05, false])
  ,
  BodyFrame.fromArr([[50, 0, -68.5], [0.5, 0, 0.137], 0, 0.08, false]),
  BodyFrame.fromArr([[86, 0, -127], [0.29, 0, 0.115], 0, 0.07, false]),
  BodyFrame.fromArr([[106, 0, -139], [0.18, 0, 0.112], 0, 0.06, false]),
  BodyFrame.fromArr([[123, 0, -120], [0.15, 0, 0.110], 0, 0.09, false])
  ,
  BodyFrame.fromArr([[-60, 0, 68.5], [-0.5, 0, -0.137], 0, 0.09, false]),
  BodyFrame.fromArr([[-76, 0, 127], [-0.29, 0, -0.115], 0, 0.08, false]),
  BodyFrame.fromArr([[-106, 0, 139], [-0.18, 0, -0.112], 0, 0.06, false]),
  BodyFrame.fromArr([[-123, 0, 120], [-0.15, 0, -0.110], 0, 0.09, false])
  ,
  BodyFrame.fromArr([[-86, 0, 69], [-0.38, 0, -0.312], 0, 0.09, false]),
  BodyFrame.fromArr([[-166, 0, -137], [0.39, 0, -0.315], 0, 0.07, false]),
  BodyFrame.fromArr([[-156, 0, -149], [0.28, 0, -0.312], 0, 0.01, false]),
  BodyFrame.fromArr([[-193, 0, -120], [0.15, 0, -0.310], 0, 0.01, false])
  ,
  BodyFrame.fromArr([[180, 0, 88.5], [-0.2, 0, 0.317], 0, 0.01, false]),
  BodyFrame.fromArr([[166, 0, 147], [-0.39, 0, 0.315], 0, 0.03, false]),
  BodyFrame.fromArr([[186, 0, 159], [-0.28, 0, 0.312], 0, 0.02, false]),
  BodyFrame.fromArr([[193, 0, 110], [-0.15, 0, 0.310], 0, 0.03, false])
  ,
  BodyFrame.fromArr([[140, 0, 68.5], [-0.1, 0, 0.217], 0, 0.05, false]),
  BodyFrame.fromArr([[166, 0, 127], [-0.29, 0, 0.215], 0, 0.02, false]),
  BodyFrame.fromArr([[186, 0, 139], [-0.28, 0, 0.212], 0, 0.03, false]),
  BodyFrame.fromArr([[193, 0, 120], [-0.25, 0, 0.210], 0, 0.05, false])
  ,
  BodyFrame.fromArr([[-140, 0, -68.5], [0.1, 0, -0.217], 0, 0.01, false]),
  BodyFrame.fromArr([[-166, 0, -127], [0.29, 0, -0.215], 0, 0.05, false]),
  BodyFrame.fromArr([[-186, 0, -139], [0.28, 0, -0.212], 0, 0.04, false]),
  BodyFrame.fromArr([[-193, 0, -120], [0.25, 0, -0.210], 0, 0.03, false])
  ,
  BodyFrame.fromArr([[-220, 0, -68.5], [0.2, 0, -0.317], 0, 0.03, false]),
  BodyFrame.fromArr([[-206, 0, -127], [0.39, 0, -0.315], 0, 0.07, false]),
  BodyFrame.fromArr([[-226, 0, -139], [0.28, 0, -0.312], 0, 0.06, false]),
  BodyFrame.fromArr([[-233, 0, -120], [0.15, 0, -0.310], 0, 0.05, false])
  ,
  BodyFrame.fromArr([[220, 0, 68.5], [-0.2, 0, 0.317], 0, 0.03, false]),
  BodyFrame.fromArr([[226, 0, 127], [-0.39, 0, 0.315], 0, 0.05, false]),
  BodyFrame.fromArr([[246, 0, 139], [-0.28, 0, 0.312], 0, 0.09, false]),
  BodyFrame.fromArr([[253, 0, 120], [-0.15, 0, 0.310], 0, 0.08, false])
  ,
  BodyFrame.fromArr([[200, 0, 68.5], [-0.1, 0, 0.217], 0, 0.06, false]),
  BodyFrame.fromArr([[226, 0, 127], [-0.29, 0, 0.215], 0, 0.05, false]),
  BodyFrame.fromArr([[266, 0, 139], [-0.28, 0, 0.212], 0, 0.04, false]),
  BodyFrame.fromArr([[253, 0, 120], [-0.25, 0, 0.210], 0, 0.03, false])
  ,
  BodyFrame.fromArr([[-190, 0, -68.5], [0.1, 0, -0.217], 0, 0.08, false]),
  BodyFrame.fromArr([[-226, 0, -127], [0.29, 0, -0.215], 0, 0.07, false]),
  BodyFrame.fromArr([[-246, 0, -139], [0.28, 0, -0.212], 0, 0.07, false]),
  BodyFrame.fromArr([[-253, 0, -120], [0.25, 0, -0.210], 0, 0.06, false])
];

const asteroids = [
  Body.fromArr([1000, 10, 'orange',   BodyFrame.zeroArr()]),
  Body.fromArr([1400, 10, 'crimson',  BodyFrame.zeroArr()]),
  Body.fromArr([1800, 12, 'red',      BodyFrame.zeroArr()]),
  Body.fromArr([2000, 12, 'orange',   BodyFrame.zeroArr()])
  ,
  Body.fromArr([1000, 10, 'red',      BodyFrame.zeroArr()]),
  Body.fromArr([1400, 10, 'crimson',  BodyFrame.zeroArr()]),
  Body.fromArr([1800, 12, 'orange',   BodyFrame.zeroArr()]),
  Body.fromArr([2000, 12, 'crimson',  BodyFrame.zeroArr()])
  ,
  Body.fromArr([1000, 10, 'red',      BodyFrame.zeroArr()]),
  Body.fromArr([1400, 10, 'orange',   BodyFrame.zeroArr()]),
  Body.fromArr([1800, 12, 'crimson',  BodyFrame.zeroArr()]),
  Body.fromArr([2000, 12, 'red',      BodyFrame.zeroArr()])
  ,
  Body.fromArr([1000, 10, 'orange',   BodyFrame.zeroArr()]),
  Body.fromArr([1400, 10, 'orange',   BodyFrame.zeroArr()]),
  Body.fromArr([1800, 12, 'red',      BodyFrame.zeroArr()]),
  Body.fromArr([2000, 12, 'crimson',  BodyFrame.zeroArr()])
  ,
  Body.fromArr([1000, 6, 'red',       BodyFrame.zeroArr()]),
  Body.fromArr([1400, 6, 'red',       BodyFrame.zeroArr()]),
  Body.fromArr([1800, 8, 'red',       BodyFrame.zeroArr()]),
  Body.fromArr([2000, 8, 'red',       BodyFrame.zeroArr()])
  ,
  Body.fromArr([1000, 6, 'orange',    BodyFrame.zeroArr()]),
  Body.fromArr([1400, 6, 'orange',    BodyFrame.zeroArr()]),
  Body.fromArr([1800, 8, 'crimson',   BodyFrame.zeroArr()]),
  Body.fromArr([2000, 8, 'crimson',   BodyFrame.zeroArr()])
];

const units = [
  Body.fromArr([100, 5, 'lightgreen',  BodyFrame.zeroArr()]),
  Body.fromArr([100, 5, 'cyan',        BodyFrame.zeroArr()]),
  Body.fromArr([100, 5, 'orange',      BodyFrame.zeroArr()]),
  Body.fromArr([200, 5, 'pink',        BodyFrame.zeroArr()]),
  Body.fromArr([100, 5, 'lightgreen',  BodyFrame.zeroArr()]),
  Body.fromArr([100, 5, 'cyan',        BodyFrame.zeroArr()]),
  Body.fromArr([100, 5, 'orange',      BodyFrame.zeroArr()]),
  Body.fromArr([200, 5, 'pink',        BodyFrame.zeroArr()])
];


export {stars, planetsStartingBodyFrames, planets, asteroidsStartingBodyFrames, asteroids, units};
