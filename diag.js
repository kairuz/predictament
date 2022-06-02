import * as utils from "./common/utils.js";
import {stars, planets, asteroids} from "./common/bodies.js";


const defaultGetEngineCurrBodiesFrame = () => {};
const defaultGetEngineStartTime = () => {};
const defaultGetEngineAppenderDeltaTimer = () => {};
const defaultGetEngineAdvancerDeltaTimer = () => {};
const defaultGetEngineFramesBuffer = () => {};
const defaultGetEngineFrameDiffBuffer = () => {};
const defaultGetCalls = () => {};

const DiagCallbacks = (
  _getEngineCurrBodiesFrame = defaultGetEngineCurrBodiesFrame,
  _getEngineStartTime = defaultGetEngineStartTime,
  _getEngineAppenderDeltaTimer = defaultGetEngineAppenderDeltaTimer,
  _getEngineAdvancerDeltaTimer = defaultGetEngineAdvancerDeltaTimer,
  _getEngineFramesBuffer = defaultGetEngineFramesBuffer,
  _getEngineFrameDiffBuffer = defaultGetEngineFrameDiffBuffer,
  _getCalls = defaultGetCalls
) => {
  const getEngineCurrBodiesFrame = typeof _getEngineCurrBodiesFrame === 'function' ? _getEngineCurrBodiesFrame : defaultGetEngineCurrBodiesFrame;
  const getEngineStartTime = typeof _getEngineStartTime === 'function' ? _getEngineStartTime : defaultGetEngineStartTime;
  const getEngineAppenderDeltaTimer = typeof _getEngineAppenderDeltaTimer === 'function' ? _getEngineAppenderDeltaTimer : defaultGetEngineAppenderDeltaTimer;
  const getEngineAdvancerDeltaTimer = typeof _getEngineAdvancerDeltaTimer === 'function' ? _getEngineAdvancerDeltaTimer : defaultGetEngineAdvancerDeltaTimer;
  const getEngineFramesBuffer = typeof _getEngineFramesBuffer === 'function' ? _getEngineFramesBuffer : defaultGetEngineFramesBuffer;
  const getEngineFrameDiffBuffer = typeof _getEngineFrameDiffBuffer === 'function' ? _getEngineFrameDiffBuffer : defaultGetEngineFrameDiffBuffer;
  const getCalls = typeof _getCalls === 'function' ? _getCalls : defaultGetCalls;

  return {
    getEngineCurrBodiesFrame,
    getEngineStartTime,
    getEngineAppenderDeltaTimer,
    getEngineAdvancerDeltaTimer,
    getEngineFramesBuffer,
    getEngineFrameDiffBuffer,
    getCalls
  };
};

const Diag = (_callbacks, _calcFps) => {
  const callbacks = _callbacks;
  const calcFps = typeof _calcFps === 'function' ? _calcFps : {};

  const fpsSpan = document.getElementById('fps');
  const currSecond1Span = document.getElementById('currSecond1');
  const currSecond2Span = document.getElementById('currSecond2');
  const callsSpan = document.getElementById('calls');
  const appenderSpan = document.getElementById('appender');
  const advancerSpan = document.getElementById('advancer');
  const framesBufferSpan = document.getElementById('framesBuffer');
  const frameDiffBufferSpan = document.getElementById('frameDiffBuffer');

  const createTableHeaderRow = (fields) => {
    const createHeaderTd = (value) => {
      const headerTh = document.createElement('th');
      headerTh.appendChild(document.createTextNode(value));
      return headerTh;
    };

    const bodiesTableHeaderTr = document.createElement('tr');
    fields.forEach((field) => bodiesTableHeaderTr.appendChild(createHeaderTd(field)));
    return bodiesTableHeaderTr;
  };
  const bodiesTable = document.getElementById('bodies');
  const bodiesTableFields = ['abs', 'type', 'ind', 'color', 'posX', 'posY', 'velX', 'velY', 'des'];
  bodiesTable.append(createTableHeaderRow(bodiesTableFields));

  const totalBodies = stars.length + planets.length + asteroids.length;
  const allRows = Array.from(Array(totalBodies).keys());
  const bodiesTableTrs = allRows.map(() => document.createElement('tr'));
  const bodiesTableTds = allRows.map(() => bodiesTableFields.map(() => document.createElement('td')));
  const bodiesTableCells = bodiesTableTds.map((bodiesTableTdsRow, i) => bodiesTableTdsRow.map((bodiesTableTd, j) => document.createTextNode(`${i},${j}`)));

  bodiesTableTds.forEach((bodiesTableTdRow, i) => {
    bodiesTableTdRow.forEach((bodiesTableTd, j) => {
      bodiesTableTd.appendChild(bodiesTableCells[i][j]);
    });
  });

  bodiesTableTrs.forEach((bodiesTableTr, i) => {
    bodiesTableTds[i].forEach((bodiesTableTd) => {
      bodiesTableTr.appendChild(bodiesTableTd);
    });
    bodiesTable.appendChild(bodiesTableTr);
  });

  const print = () => {
    const printBody = (row, type, absInd, ind, body, bodyFrame) => {
      let cellInd = 0;
      row[cellInd++].textContent = `${absInd}`;
      row[cellInd++].textContent = type;
      row[cellInd++].textContent = `${ind}`;
      row[cellInd++].textContent = body.getColor();
      row[cellInd++].textContent = bodyFrame.getPosition().getX().toFixed(2);
      row[cellInd++].textContent = bodyFrame.getPosition().getZ().toFixed(2);
      row[cellInd++].textContent = bodyFrame.getVelocity().getX().toFixed(2);
      row[cellInd++].textContent = bodyFrame.getVelocity().getZ().toFixed(2);
      row[cellInd++].textContent = bodyFrame.isDestroyed();
    };

    const currBodiesFrame = callbacks.getEngineCurrBodiesFrame();
    if (currBodiesFrame !== null) {
      let offset = 0;
      stars.forEach(
        (body, i) => {
          const bodyFrame = currBodiesFrame.getStarsFrame()[i];
          printBody(bodiesTableCells[offset], 'S', offset, i, body, bodyFrame);
          offset++;
        }
      );
      planets.forEach(
        (body, i) => {
          const bodyFrame = currBodiesFrame.getPlanetsFrame()[i];
          printBody(bodiesTableCells[offset], 'P', offset, i, body, bodyFrame);
          offset++;
        }
      );
      asteroids.forEach(
        (body, i) => {
          const bodyFrame = currBodiesFrame.getAsteroidsFrame()[i];
          printBody(bodiesTableCells[offset], 'A', offset, i, body, bodyFrame);
          offset++;
        }
      );
    }

    const now = utils.Timestamp.now();
    const runningMillis = now.getMillisecond() - callbacks.getEngineStartTime().getMillisecond();
    const currSecondTextContent = `gameSec=${now.getSecond()},\nrealSec=${now.getRealSecond()},\ndate=${new Date().toISOString()}`;
    currSecond1Span.textContent = currSecondTextContent;
    currSecond2Span.textContent = currSecondTextContent;

    fpsSpan.textContent = `fps: ${calcFps()}`;

    const appenderDeltaTimer = callbacks.getEngineAppenderDeltaTimer();
    const appenderCount = appenderDeltaTimer.getCount();
    appenderSpan.textContent =
      `appenderCount=${appenderCount},deltaAverage=${(runningMillis/appenderCount).toFixed(2)},high=${appenderDeltaTimer.getHighest().getMillisecond()},low=${appenderDeltaTimer.getLowest().getMillisecond()}`;
    const advancerDeltaTimer = callbacks.getEngineAdvancerDeltaTimer();
    const advancerCount = advancerDeltaTimer.getCount();
    advancerSpan.textContent =
      `advancerCount=${advancerCount},deltaAverage=${(runningMillis/advancerCount).toFixed(2)},high=${advancerDeltaTimer.getHighest().getMillisecond()},low=${advancerDeltaTimer.getLowest().getMillisecond()}`;

    const framesBuffer = callbacks.getEngineFramesBuffer();
    framesBufferSpan.textContent =
      `...framesBuffer (` +
        `size=${framesBuffer.getSize()},` +
        `firstSec=${framesBuffer.isNotEmpty() ? framesBuffer.getFirst().getSecond() : 'nil'}, ` +
        `lastSec=${framesBuffer.isNotEmpty() ? framesBuffer.getLast().getSecond() : 'nil'} ` +
      `)`;

    const frameDiffBuffer = callbacks.getEngineFrameDiffBuffer();
    frameDiffBufferSpan.textContent =
      `frameDiffBuffer (` +
        `size=${frameDiffBuffer.getSize()},` +
        `firstSec=${frameDiffBuffer.isNotEmpty() ? frameDiffBuffer.getFirst().getSecond() : 'nil'}, ` +
        `lastSec=${frameDiffBuffer.isNotEmpty() ? frameDiffBuffer.getLast().getSecond() : 'nil'} ` +
      `)`;
    const calls = callbacks.getCalls();
    callsSpan.textContent = `calls animate=${calls.animateCalls}, draw=${calls.drawCalls}, skips=${calls.drawSkips}, drawing=${calls.drawing}`;
  };

  return {print};
};

Diag.DiagCallbacks = DiagCallbacks;


export default Diag;
