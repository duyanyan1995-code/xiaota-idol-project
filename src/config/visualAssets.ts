import { CHARACTER_IMAGES } from './characterImages';
import type {
  ActionVisualKey,
  CharacterImage,
  CharacterImageKey,
  EndingCgKey,
  EventCgKey,
  FeedbackVisual,
} from '../types/game';

export const LEGACY_CHARACTER_IMAGES = CHARACTER_IMAGES;

export const ACTION_VISUALS: Record<ActionVisualKey, CharacterImage> = {
  theaterTrainingAction: makeVisual(
    'theaterTrainingAction',
    '/images/xiaota/actions/theater-training.png',
    CHARACTER_IMAGES.practice,
    '剧场训练行动立绘',
  ),
  fanServiceAction: makeVisual(
    'fanServiceAction',
    '/images/xiaota/actions/fan-service.png',
    CHARACTER_IMAGES.wink,
    '粉丝营业行动立绘',
  ),
  outsideExposureAction: makeVisual(
    'outsideExposureAction',
    '/images/xiaota/actions/outside-exposure.png',
    CHARACTER_IMAGES.happy,
    '外务曝光行动立绘',
  ),
  stageFocusAction: makeVisual(
    'stageFocusAction',
    '/images/xiaota/actions/stage-focus.png',
    CHARACTER_IMAGES.stage,
    '舞台专项行动立绘',
  ),
  imageBuildingAction: makeVisual(
    'imageBuildingAction',
    '/images/xiaota/actions/image-building.png',
    CHARACTER_IMAGES.happy,
    '形象经营行动立绘',
  ),
  restAndReflectAction: makeVisual(
    'restAndReflectAction',
    '/images/xiaota/actions/rest-and-reflect.png',
    CHARACTER_IMAGES.base,
    '休整沉淀行动立绘',
  ),
  stableOperationAction: makeVisual(
    'stableOperationAction',
    '/images/xiaota/actions/stable-operation.png',
    CHARACTER_IMAGES.base,
    '稳定运营行动立绘',
  ),
  specialSoloWorkAction: makeFallbackVisual(
    'specialSoloWorkAction',
    '/images/xiaota/actions/special-solo-work.png',
    CHARACTER_IMAGES.happy,
    '个人外务行动立绘',
  ),
  specialIntensiveTrainingAction: makeFallbackVisual(
    'specialIntensiveTrainingAction',
    '/images/xiaota/actions/special-intensive-training.png',
    CHARACTER_IMAGES.practice,
    '高强度集训行动立绘',
  ),
  specialBirthdaySupportAction: makeFallbackVisual(
    'specialBirthdaySupportAction',
    '/images/xiaota/actions/special-birthday-support.png',
    CHARACTER_IMAGES.wink,
    '生日应援筹备行动立绘',
  ),
  specialStyleShiftAction: makeFallbackVisual(
    'specialStyleShiftAction',
    '/images/xiaota/actions/special-style-shift.png',
    CHARACTER_IMAGES.happy,
    '风格转型行动立绘',
  ),
};

export const EVENT_CGS: Record<EventCgKey, CharacterImage> = {
  fanLetterCg: makeVisual(
    'fanLetterCg',
    '/images/xiaota/events/fan-letter.png',
    CHARACTER_IMAGES.happy,
    '粉丝来信剧情 CG',
  ),
  fanCreationCg: makeVisual(
    'fanCreationCg',
    '/images/xiaota/events/fan-creation.png',
    CHARACTER_IMAGES.wink,
    '粉丝二创出圈剧情 CG',
  ),
  stageMistakeCg: makeVisual(
    'stageMistakeCg',
    '/images/xiaota/events/stage-mistake.png',
    CHARACTER_IMAGES.tired,
    '舞台小失误剧情 CG',
  ),
  extraPracticeCg: makeVisual(
    'extraPracticeCg',
    '/images/xiaota/events/extra-practice.png',
    CHARACTER_IMAGES.practice,
    '练习室加练剧情 CG',
  ),
  styleChallengeCg: makeVisual(
    'styleChallengeCg',
    '/images/xiaota/events/style-challenge.png',
    CHARACTER_IMAGES.happy,
    '挑战不同风格剧情 CG',
  ),
  summerInviteCg: makeVisual(
    'summerInviteCg',
    '/images/xiaota/events/summer-invite.png',
    CHARACTER_IMAGES.summer,
    '夏日邀约剧情 CG',
  ),
  lowMoodCg: makeVisual(
    'lowMoodCg',
    '/images/xiaota/events/low-mood.png',
    CHARACTER_IMAGES.tired,
    '心情低落剧情 CG',
  ),
  secretHappyCg: makeVisual(
    'secretHappyCg',
    '/images/xiaota/events/secret-happy.png',
    CHARACTER_IMAGES.happy,
    '被夸奖后偷偷开心剧情 CG',
  ),
  dailyMomentCg: makeFallbackVisual(
    'dailyMomentCg',
    '/images/xiaota/events/daily-moment.png',
    CHARACTER_IMAGES.base,
    '普通但重要的一天剧情 CG',
  ),
};

export const ENDING_CGS: Record<EndingCgKey, CharacterImage> = {
  idolPeakEndingCg: makeEndingCg(
    'idolPeakEndingCg',
    '/images/xiaota/endings/idol-peak.png',
    '偶像顶点结局 CG',
  ),
  kamiSevenEndingCg: makeEndingCg(
    'kamiSevenEndingCg',
    '/images/xiaota/endings/kami-seven.png',
    '神七高位结局 CG',
  ),
  top16CoreEndingCg: makeEndingCg(
    'top16CoreEndingCg',
    '/images/xiaota/endings/top16-core.png',
    'TOP16 稳定核心结局 CG',
  ),
  theaterLegendEndingCg: makeEndingCg(
    'theaterLegendEndingCg',
    '/images/xiaota/endings/theater-legend.png',
    '剧场传说结局 CG',
  ),
  stageMemoryEndingCg: makeEndingCg(
    'stageMemoryEndingCg',
    '/images/xiaota/endings/stage-memory.png',
    '舞台记忆结局 CG',
  ),
  fanBondEndingCg: makeEndingCg(
    'fanBondEndingCg',
    '/images/xiaota/endings/fan-bond.png',
    '粉丝羁绊结局 CG',
  ),
  outsideBreakthroughEndingCg: makeEndingCg(
    'outsideBreakthroughEndingCg',
    '/images/xiaota/endings/outside-breakthrough.png',
    '外务突破结局 CG',
  ),
  steadyOperationEndingCg: makeEndingCg(
    'steadyOperationEndingCg',
    '/images/xiaota/endings/steady-operation.png',
    '稳定运营结局 CG',
  ),
  regretGraduationEndingCg: makeEndingCg(
    'regretGraduationEndingCg',
    '/images/xiaota/endings/regret-graduation.png',
    '遗憾毕业结局 CG',
  ),
};

export function getVisualAsset(
  type: FeedbackVisual['type'],
  key: FeedbackVisual['key'],
): CharacterImage {
  if (type === 'actionVisual') {
    return ACTION_VISUALS[key as ActionVisualKey];
  }

  if (type === 'eventCg') {
    return EVENT_CGS[key as EventCgKey];
  }

  if (type === 'endingCg') {
    return ENDING_CGS[key as EndingCgKey];
  }

  return LEGACY_CHARACTER_IMAGES[key as CharacterImageKey];
}

function makeVisual(
  key: ActionVisualKey | EventCgKey,
  src: string,
  fallback: CharacterImage,
  label: string,
  plannedSrc = src,
): CharacterImage {
  return {
    ...fallback,
    key,
    src,
    plannedSrc,
    alt: label,
    label,
  };
}

function makeFallbackVisual(
  key: ActionVisualKey | EventCgKey,
  plannedSrc: string,
  fallback: CharacterImage,
  label: string,
): CharacterImage {
  return makeVisual(key, fallback.src, fallback, label, plannedSrc);
}

function makeEndingCg(key: EndingCgKey, src: string, label: string): CharacterImage {
  return {
    key,
    src,
    plannedSrc: src,
    alt: label,
    label,
    placeholderText: '结局 CG 待接入',
  };
}
