import * as config from './config.mjs';


const Timestamp = (_millisecond, _second, _realMillisecond, _realSecond) => {
  const millisecond = _millisecond;
  const second = _second;
  const realMillisecond = _realMillisecond;
  const realSecond = _realSecond;

  return {
    getMillisecond: () => millisecond,
    getSecond: () => second,
    getRealMillisecond: () => realMillisecond,
    getRealSecond: () => realSecond,
    toString: () => `timestamp gameSec=${second},realSec=${realSecond},gameMs=${millisecond},realMs=${realMillisecond}`,
  };
};
Timestamp.fromMillisecond = (_millisecond) => {
  const millisecond = _millisecond;
  const second = Math.trunc(millisecond / 1000);
  const realMillisecond = Math.trunc(millisecond / config.getGameMillisecond());
  const realSecond = Math.trunc(realMillisecond / 1000);

  return Timestamp(millisecond, second, realMillisecond, realSecond);
};
Timestamp.fromRealMillisecond = (_realMillisecond) => {
  const realMillisecond = _realMillisecond;
  const millisecond = Math.trunc(realMillisecond * config.getGameMillisecond());
  const second = Math.trunc(millisecond / 1000);
  const realSecond = Math.trunc(realMillisecond / 1000);

  return Timestamp(millisecond, second, realMillisecond, realSecond);
};
Timestamp.fromDate = (_date) => Timestamp.fromRealMillisecond(_date.getTime());
Timestamp.now = () => Timestamp.fromRealMillisecond(performance.now());
Timestamp.zero = () => Timestamp.fromMillisecond(0);

const SyncTime = (_timestamp, _capturedAt, _averageLatencyCallback) => {
  let timestamp = _timestamp;
  let capturedAt = _capturedAt;
  const averageLatencyCallback = _averageLatencyCallback;

  const millisSinceCaptured = () => Timestamp.now().getMillisecond() - capturedAt.getMillisecond();

  return {
    millisSinceCaptured,
    update: (_timestamp, _capturedAt) => {
      timestamp = _timestamp;
      capturedAt = _capturedAt;
    },
    getTimestamp: () => timestamp,
    getCapturedAt: () => capturedAt,
    getAverageLatencyCallback: () => averageLatencyCallback,
    predictTimestamp: () => Timestamp.fromMillisecond(timestamp.getMillisecond() + (millisSinceCaptured() - averageLatencyCallback()))
  };
};

const LinkedQueue = () => {
  let size = 0;
  let first = null;
  let last = null;
  let idGen = 0;
  let pollCount = 0;

  const isEmpty = () => size === 0;

  const Node = (d) => {
    const id = idGen++;
    const data = d;
    let next = null;
    let previous = null;

    return {
      getId: () => id,
      getIndex: () => id - pollCount,
      getData: () => data,
      isFirst: () => previous === null,
      isNotFirst: function(){return !this.isFirst();},
      isLast: () => next === null,
      isNotLast: function(){return !this.isLast();},
      getNext: () => next,
      getPrevious: () => previous,
      setNext: (n) => next = n,
      setPrevious: (p) => previous = p,
      toString: function(){return `id=${id},index=${this.getIndex()},data=${data},isFirst=${this.isFirst()},isLast=${this.isLast()}`;}
    };
  };

  return {
    isEmpty: () => isEmpty(),
    isNotEmpty: () => !isEmpty(),
    [Symbol.iterator]: () => {
      let isStarted = false;
      let done = null;
      let curr = null;
      return {
        next: () => {
          if (!isStarted) {
            curr = first;
            isStarted = true;
          }
          const value = curr !== null ? curr.getData() : undefined;
          done = curr === null;
          if (curr !== null) {
            curr = curr.getNext();
          }
          return {
            value: value,
            done: done
          }
        }
      }
    },
    reverseIterator: () => ({
      [Symbol.iterator]: () => {
        let isStarted = false;
        let done = null;
        let curr = null;
        return {
          next: () => {
            if (!isStarted) {
              curr = last;
              isStarted = true;
            }
            const value = curr !== null ? curr.getData() : undefined;
            done = curr === null;
            if (curr !== null) {
              curr = curr.getPrevious();
            }
            return {
              value: value,
              done: done
            }
          }
        }
      }
    }),
    getFirst: () => first.getData(),
    getFirstN: (n) => {
      const arr = [];
      if (isEmpty()) {
        return arr;
      }
      let temp = first;
      let i = 0;
      while (i++ < n) {
        arr.push(temp.getData());
        if (temp.isLast()) {
          break;
        }
        temp = temp.getNext();
      }
      return arr;
    },
    getLast: () => last.getData(),
    getLastN: (n) => {
      const arr = [];
      if (isEmpty()) {
        return arr;
      }
      let temp = last;
      let i = 0;
      while (i++ < n) {
        // arr.push(temp.getData());
        arr.unshift(temp.getData());
        if (temp.isFirst()) {
          break;
        }
        temp = temp.getPrevious();
      }
      return arr;
    },
    addLast: (data) => {
      const node = Node(data);
      if (isEmpty()) {
        first = node;
      }
      else {
        last.setNext(node);
        node.setPrevious(last);
      }
      last = node;
      size++;
    },
    pollFirst: () => {
      if (isEmpty()) {
        throw 'pollFirst() - no such element';
      }
      pollCount++;
      const removed = first;
      first = first.getNext();
      size--;
      if (isEmpty()) {
        last = null;
      }
      else {
        first.setPrevious(null);
      }
      return removed.getData();
    },
    pollLast: () => {
      if (isEmpty()) {
        throw 'pollLast() - no such element';
      }
      idGen--;
      const removed = last;
      last = last.getPrevious();
      size--;
      if (isEmpty()) {
        first = null;
      }
      else {
        last.setNext(null);
      }
      return removed.getData();
    },
    getSize: () => size,
    copyOf: function(){return LinkedQueue.copyOf(this);},
    toString: () => {
      let i = 0;
      let str = `idGen=${idGen},pollCount=${pollCount},size=${size};;`;
      let temp = first;
      while (temp !== null) {
        str += `i=${i};node=${temp};`;
        i++;
        temp = temp.getNext();
      }
      return str;
    }
  };
};
LinkedQueue.copyOf = (queue) => {
  const copy = LinkedQueue();
  for (const data of queue) {
    copy.addLast(data);
  }
  return copy;
};

const Sequence = (_start = 0) => {
  let curr = _start;
  return {
    next: () => ++curr,
    matches: (_curr) => curr === _curr,
    getCurr: () => curr,
    setCurr: (_curr) => curr = _curr
  };
};

const DeltaTimer = () => {
  let count = 0;
  let lastMillis = null;
  let highest = null;
  let lowest = null;

  const update = () => {
    count++;
    const now = Timestamp.now();
    const delta = lastMillis !== null ? Timestamp.fromMillisecond(now.getMillisecond() - lastMillis.getMillisecond()) : null;
    if (delta !== null) {
      if (highest === null || delta.getMillisecond() > highest.getMillisecond()) {
        highest = delta;
      }
      if (lowest === null || delta.getMillisecond() < lowest.getMillisecond()) {
        lowest = delta;
      }
    }
    lastMillis = now;
  };

  return {
    update,
    getCount: () => count,
    getHighest: () => highest !== null ? highest : Timestamp.zero(),
    getLowest: () => lowest !== null ? lowest : Timestamp.zero()
  }
};

const Pinger = (_socket) => {
  const socket = _socket;
  let latencyAverage = 0;
  let latencyHighest = null;
  let latencyLowest = null;
  const latencies = LinkedQueue();
  let latencyAccumulated = 0;
  let lastPingTime = null;

  const ping = () => {
    lastPingTime = Timestamp.now();
    socket.send('ping');
  };

  const handlePong = () => {
    if (lastPingTime !== null) {
      const pongTime = Timestamp.now();
      const latency = (pongTime.getMillisecond() - lastPingTime.getMillisecond()) / 2;
      if (latency > latencyHighest || latencyHighest === null) {
        latencyHighest = latency;
      }
      if (latency < latencyLowest || latencyLowest === null) {
        latencyLowest = latency;
      }
      latencies.addLast(latency);
      latencyAccumulated += latency;
      if (latencies.getSize() === 21) {
        latencyAccumulated -= latencies.pollFirst();
      }

      latencyAverage = latencyAccumulated / latencies.getSize();
    }
    setTimeout(ping, latencies.getSize() >= 20 ? 200 : 0);
  };

  return {
    start: ping,
    handlePong: handlePong,
    getLatencyAverage: () => latencyAverage,
    getLatencyHighest: () => latencyHighest,
    getLatencyLowest: () => latencyLowest,
    getLatencies: () => latencies,
    getLatencyAccumulated: () => latencyAccumulated,
    getLastPingTime: () => lastPingTime
  }
};

const defaultLoaderFn = (_loaderFnCallback = (_result) => {}) => {};
const LazyLoader = (_loaderFn = defaultLoaderFn) => {
  const loaderFn = typeof _loaderFn === 'function' ? _loaderFn : defaultLoaderFn;
  let loading = false;
  let loaded = false;
  const observers = [];
  let result = null;

  const load = (getCallback) => {
    loading = true;
    const loaderFnCallback = (_result) => {
      result = _result;
      setTimeout(() => getCallback(result));
      observers.forEach((observerFn) => setTimeout(() => observerFn(result)));
      observers.length = 0;
      loaded = true;
      loading = false;
    };
    loaderFn(loaderFnCallback);
  };

  return {
    get: (getCallback) => {
      if (loaded === false) {
        if (loading === false) {
          load(getCallback);
        }
        else {
          observers.push(getCallback);
        }
      }
      else {
        getCallback(result);
      }
    },
    isLoaded: () => loaded,
    isLoading: () => loading,
    getResult: () => result
  };
};

const degToRad = (degrees) => degrees * (Math.PI / 180);

const radToDeg = (radians) => radians * (180 / Math.PI);

const sinr = (radians) => Math.round(Math.sin(radians) * 1000) / 1000;
const sind = (degrees) => sinr(degToRad(degrees));
const cosr = (radians) => Math.round(Math.cos(radians) * 1000) / 1000;
const cosd = (degrees) => cosr(degToRad(degrees));
const tanr = (radians) => Math.round(Math.tan(radians) * 1000) / 1000;
const tand = (degrees) => tanr(degToRad(degrees));


const asyncWhile = (callback, condition, pause = 0) => {
  if (condition() === true) {
    callback();
    setTimeout(asyncWhile, pause);
  }
};


export {
  Timestamp, SyncTime, LinkedQueue, Sequence, DeltaTimer, Pinger, LazyLoader,
  degToRad, radToDeg, sinr, sind, cosr, cosd, tanr, tand
};
