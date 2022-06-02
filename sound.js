import {LazyLoader, Sequence} from "./common/utils.js";


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

const Sound = () => {
  let audioContext = null;
  let alternator = null;

  const lazyAudioContextLoader = LazyLoader((loaderFnCallback) => loaderFnCallback(new AudioContext()));

  const lazySampleUtilsLoader = LazyLoader((loaderFnCallback) => import('https://kairuz.github.io/acyoustic/sample-utils.js').then(loaderFnCallback));

  const lazySoundFxLoader = LazyLoader((loaderFnCallback) => {
    Promise
      .all([
        new Promise((resolve) => lazyAudioContextLoader.get((audioContext) => resolve(audioContext))),
        new Promise((resolve) => lazySampleUtilsLoader.get((SampleUtils) => resolve(SampleUtils))),
      ])
      .then((audioContextAndSampleUtils) => {
        audioContext = audioContextAndSampleUtils[0];
        const SampleUtils = audioContextAndSampleUtils[1];
        Promise
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
            let ind = 0;
            const effects = Effects(audioContext, SampleUtils,
                                    audioBuffers[ind++], audioBuffers[ind++], audioBuffers[ind++],
                                    audioBuffers[ind++],
                                    audioBuffers[ind++], audioBuffers[ind++], audioBuffers[ind++],
                                    audioBuffers[ind++],
                                    audioBuffers[ind++],
                                    audioBuffers[ind++]);
            loaderFnCallback([SampleUtils, effects]);
          });
      });
  });

  const lazyMusicLoader = LazyLoader((loaderFnCallback) => {
    Promise
      .all([
        new Promise((resolve) => lazyAudioContextLoader.get((audioContext) => resolve(audioContext))),
        Promise
          .all([
            new Promise((resolve) => lazySampleUtilsLoader.get((module) => resolve(module))),
            import('https://kairuz.github.io/acyoustic/projects/gymno.js'),
            import('https://kairuz.github.io/acyoustic/projects/climb.js'),
            import('https://kairuz.github.io/acyoustic/projects/predictament.js'),
            import('https://kairuz.github.io/acyoustic/alternator.js')
          ])
      ])
      .then((audioContextAndModules) => {
        audioContext = audioContextAndModules[0];
        const modules = audioContextAndModules[1];
        const SampleUtils = modules[0];
        const gymno = modules[1].default;
        const climb = modules[2].default;
        const predictament = modules[3].default;
        const Alternator = modules[4].default;

        Promise
          .all([
            SampleUtils.loadSampleBuffers(audioContext, gymno.samples),
            SampleUtils.loadSampleBuffers(audioContext, climb.samples),
            SampleUtils.loadSampleBuffers(audioContext, predictament.samples)
          ])
          .then(() => {
            const compositionDescriptors = [
              Alternator.CompositionDescriptor(gymno.compositions.long, gymno.progressions, gymno.samples),
              Alternator.CompositionDescriptor(climb.compositions.long, climb.progressions, climb.samples),
              Alternator.CompositionDescriptor(predictament.compositions.long, predictament.progressions, predictament.samples)
            ];
            alternator = Alternator(
              audioContext, compositionDescriptors
            );

            loaderFnCallback([modules, alternator]);
          });
      });
  });

  return {
    getAudioContext: () => audioContext,
    getAlternator: () => alternator,
    getLazyAudioContextLoader: () => lazyAudioContextLoader,
    getLazySampleUtilsLoader: () => lazySampleUtilsLoader,
    getLazySoundFxLoader: () => lazySoundFxLoader,
    getLazyMusicLoader: () => lazyMusicLoader
  };
};

Sound.Effects = Effects;


export default Sound;
