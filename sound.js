import {LazyLoader, Sequence} from "./common/utils.js";


const Alternator = (_schedulers,
                    _alternateCallback = (_schedulerIndex, _schedulersLength) => {},
                    _stopCallback = (_schedulerIndex, _schedulersLength) => {}) => {
  const schedulers = [..._schedulers];
  const alternateCallback = typeof _alternateCallback === 'function' ? _alternateCallback : (_schedulerIndex, _schedulersLength) => {};
  const stopCallback = typeof _stopCallback === 'function' ? _stopCallback : (_schedulerIndex, _schedulersLength) => {};

  let running = false;
  let schedulerIndex = schedulers.length - 1;
  let currScheduler = {
    stop: () => {},
    stopAfterLastScheduled : () => {}
  };

  const alternate = () => {
    schedulerIndex++;
    schedulerIndex = schedulerIndex % schedulers.length;
    currScheduler = schedulers[schedulerIndex];

    currScheduler.start(() => {
      alternate();
    });
    alternateCallback(schedulerIndex, schedulers.length);
  };

  return {
    isRunning: () => running,
    start: () => {
      if (running === false) {
        running = true;
        alternate();
      }
      else {
        console.warn(`alternator illegal state - running=${running}`);
      }
    },
    next: () => {
      currScheduler.stopAfterLastScheduled(true, () => {
        alternate();
      });
    },
    stop: () => {
      if (running === true) {
        running = false;
        currScheduler.stop(true);
        stopCallback(schedulerIndex, schedulers.length);
      }
      else {
        console.warn(`alternator illegal state - running=${running}`);
      }
    },
    stopAfterLastScheduled: () => {
      if (running === true) {
        currScheduler.stopAfterLastScheduled(true, () => {
          running = false;
          stopCallback(schedulerIndex, schedulers.length);
        });
      }
      else {
        console.warn(`alternator illegal state - running=${running}`);
      }
    },
    get schedulersLength(){return schedulers.length;}
  };
};

const Effects = (audioContext, SampleUtils,
                 _booster01Buffer, _booster02Buffer, _booster03Buffer,
                 _death01Buffer,
                 _explosion01Buffer, _explosion02Buffer, _explosion03Buffer,
                 _land01Buffer, _leap01Buffer, _spawn01Buffer) => {
  const booster01Buffer = _booster01Buffer;
  const booster02Buffer = _booster02Buffer;
  const booster03Buffer = _booster03Buffer;
  const death01Buffer = _death01Buffer;
  const explosion01Buffer = _explosion01Buffer;
  const explosion02Buffer = _explosion02Buffer;
  const explosion03Buffer = _explosion03Buffer;
  const land01Buffer = _land01Buffer;
  const leap01Buffer = _leap01Buffer;
  const spawn01Buffer = _spawn01Buffer;

  const boosterBuffers = [booster01Buffer, booster02Buffer, booster03Buffer];
  const explosionBuffers = [explosion01Buffer, explosion02Buffer, explosion03Buffer];

  const sampleNodeSeq = Sequence();
  const playingNodes = new Map();

  const playSampleNode = (audioBuffer, gain = null) => {
    const sampleNode = SampleUtils.newSampleNode(audioBuffer, audioContext, gain);
    const nodeId = sampleNodeSeq.next();
    playingNodes.set(nodeId, sampleNode);
    sampleNode.addEventListener('ended', () => {
      playingNodes.delete(nodeId);
    });
    sampleNode.start();
  };

  return {
    playBoosterNode: () => playSampleNode(boosterBuffers[Math.trunc(Math.random() * boosterBuffers.length)], 0.3),
    playDeathNode: () => playSampleNode(death01Buffer, 0.6),
    playExplosionNode: () => playSampleNode(explosionBuffers[Math.trunc(Math.random() * explosionBuffers.length)], 0.2),
    playExplosionNodeSoft: () => playSampleNode(explosionBuffers[Math.trunc(Math.random() * explosionBuffers.length)], 0.1),
    playLandNode: () => playSampleNode(land01Buffer),
    playLeapNode: () => playSampleNode(leap01Buffer),
    playSpawnNode: () => playSampleNode(spawn01Buffer, 0.3),
    stop: () => playingNodes.forEach((playingNode) => playingNode.stop())
  };
};

const lazySampleUtilsLoader = LazyLoader(() => import('https://kairuz.github.io/acyoustic/sample-utils.js'));

const modalityVolumeFactorCallback = () => 0.7;
const ModalityScheduler = ((_conductor) => {
  const conductor = _conductor;
  let schedulerStartStopCallback = () => {};
  let stopping = false;
  let running = false;
  let stopTimeoutId = null;

  const start = (_schedulerStartStopCallback = () => {}) => {
    schedulerStartStopCallback = _schedulerStartStopCallback;
    conductor.start();
    stopTimeoutId = setTimeout(() => stopAfterLastScheduled(), 5 * 60 * 1000); // play for 5 minutes
  };

  const stop = (cancelStartStopCallback = false) => {
    clearTimeout(stopTimeoutId);
    conductor.stop();
    if (!cancelStartStopCallback) {
      schedulerStartStopCallback();
    }
  };

  const stopAfterLastScheduled = () => {
    clearTimeout(stopTimeoutId);
    const lastBarScheduledBarEndSecs = conductor.lastBarScheduledFor + conductor.barLengthSecs;
    const lastBarScheduledBarEndFromNow = lastBarScheduledBarEndSecs - conductor.player.currentTime;
    setTimeout(() => stop(), Math.trunc(lastBarScheduledBarEndFromNow * 1000));
  };

  return {
    start,
    stop,
    stopAfterLastScheduled,
    isRunning: () => running === true,
    isStopping: () => stopping === true,
    isStopped: () => running === false && stopping === false,
  };
});

const Sound = () => {
  const lazyAudioContextLoader = LazyLoader(() => new AudioContext());

  const lazySoundFxLoader = LazyLoader(() => {
    return Promise
      .all([
        lazyAudioContextLoader.get(),
        lazySampleUtilsLoader.get()
      ])
      .then((audioContextAndSampleUtils) => {
        const [audioContext, SampleUtils] = audioContextAndSampleUtils;
        return Promise
          .all([
            SampleUtils.downloadBuffer(audioContext, 'https://kairuz.github.io/assets/audio/effects/booster-01.ogg'),
            SampleUtils.downloadBuffer(audioContext, 'https://kairuz.github.io/assets/audio/effects/booster-02.ogg'),
            SampleUtils.downloadBuffer(audioContext, 'https://kairuz.github.io/assets/audio/effects/booster-03.ogg'),
            SampleUtils.downloadBuffer(audioContext, 'https://kairuz.github.io/assets/audio/effects/death-01.ogg'),
            SampleUtils.downloadBuffer(audioContext, 'https://kairuz.github.io/assets/audio/effects/explosion-01.ogg'),
            SampleUtils.downloadBuffer(audioContext, 'https://kairuz.github.io/assets/audio/effects/explosion-02.ogg'),
            SampleUtils.downloadBuffer(audioContext, 'https://kairuz.github.io/assets/audio/effects/explosion-03.ogg'),
            SampleUtils.downloadBuffer(audioContext, 'https://kairuz.github.io/assets/audio/effects/land-01.ogg'),
            SampleUtils.downloadBuffer(audioContext, 'https://kairuz.github.io/assets/audio/effects/leap-01.ogg'),
            SampleUtils.downloadBuffer(audioContext, 'https://kairuz.github.io/assets/audio/effects/spawn-01.ogg')
          ])
          .then((audioBuffers) => {
            const [
              booster01Buffer, booster02Buffer, booster03Buffer,
              death01Buffer,
              explosion01Buffer, explosion02Buffer, explosion03Buffer,
              land01Buffer, leap01Buffer, spawn01Buffer
            ] = audioBuffers;
            const effects = Effects(audioContext, SampleUtils,
                                    booster01Buffer, booster02Buffer, booster03Buffer,
                                    death01Buffer,
                                    explosion01Buffer, explosion02Buffer, explosion03Buffer,
                                    land01Buffer, leap01Buffer, spawn01Buffer);
            return Promise.resolve([SampleUtils, effects]);
          });
      });
  });

  const lazySchedulersModulesLoader = LazyLoader(() => {
    return Promise
      .all([
        import('https://kairuz.github.io/acyoustic/projects/gymno.js'),
        import('https://kairuz.github.io/acyoustic/projects/climb.js'),
        import('https://kairuz.github.io/acyoustic/projects/predictament.js'),
        lazySampleUtilsLoader.get(),
        import('https://kairuz.github.io/acyoustic/scheduler.js'),
        import('https://kairuz.github.io/modality/factory.js')
      ]);
  });

  const lazySchedulersLoader = LazyLoader(() => {
    return Promise
      .all([
        lazyAudioContextLoader.get(),
        lazySchedulersModulesLoader.get()
      ])
      .then((audioContextAndModules) => {
        const [
          audioContext,
          [
            {default: gymno},
            {default: climb},
            {default: predictament},
            SampleUtils,
            {default: Scheduler},
            {default: initConductor}
          ]
        ] = audioContextAndModules;

        return Promise
          .all([
            SampleUtils.loadSampleBuffers(audioContext, gymno.samples),
            SampleUtils.loadSampleBuffers(audioContext, climb.samples),
            SampleUtils.loadSampleBuffers(audioContext, predictament.samples),
            initConductor(audioContext, modalityVolumeFactorCallback)
          ])
          .then((sampleBuffersAndConductor) => {
            return Promise.resolve([
              Scheduler(gymno.compositions.long, gymno.progressions, gymno.samples, audioContext),
              Scheduler(climb.compositions.long, climb.progressions, climb.samples, audioContext),
              Scheduler(predictament.compositions.long, predictament.progressions, predictament.samples, audioContext),
              ModalityScheduler(sampleBuffersAndConductor[3])
            ]);
          });
      });
  });

  const lazyAlternatorLoader = LazyLoader(() => {
    return lazySchedulersLoader.get().then((schedulers) => Promise.resolve(Alternator(schedulers)));
  });

  return {
    getLazyAudioContextLoader: () => lazyAudioContextLoader,
    getLazySoundFxLoader: () => lazySoundFxLoader,
    getLazyAlternatorLoader: () => lazyAlternatorLoader
  };
};

Sound.Effects = Effects;
Sound.lazySampleUtilsLoader = lazySampleUtilsLoader;


export default Sound;
