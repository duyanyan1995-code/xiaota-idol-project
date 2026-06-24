import { CHARACTER_IMAGES } from './characterImages';
import { publicPath } from './publicPath';
import type {
  ActionVisualKey,
  AnnualCgKey,
  CharacterImage,
  CharacterImageKey,
  EndingCgKey,
  EventCgKey,
  FeedbackVisual,
  TimelineCgKey,
  WorkCgKey,
} from '../types/game';

export const LEGACY_CHARACTER_IMAGES = CHARACTER_IMAGES;

export const ACTION_VISUALS: Record<ActionVisualKey, CharacterImage> = {
  theaterTrainingAction: makeVisual(
    'theaterTrainingAction',
    publicPath('images/xiaota/actions/theater-training.png'),
    CHARACTER_IMAGES.practice,
    '剧场训练行动立绘',
  ),
  fanServiceAction: makeVisual(
    'fanServiceAction',
    publicPath('images/xiaota/actions/fan-service.png'),
    CHARACTER_IMAGES.wink,
    '粉丝营业行动立绘',
  ),
  outsideExposureAction: makeVisual(
    'outsideExposureAction',
    publicPath('images/xiaota/actions/outside-exposure.png'),
    CHARACTER_IMAGES.happy,
    '外务曝光行动立绘',
  ),
  stageFocusAction: makeVisual(
    'stageFocusAction',
    publicPath('images/xiaota/actions/stage-focus.png'),
    CHARACTER_IMAGES.stage,
    '舞台专项行动立绘',
  ),
  imageBuildingAction: makeVisual(
    'imageBuildingAction',
    publicPath('images/xiaota/actions/image-building.png'),
    CHARACTER_IMAGES.happy,
    '形象经营行动立绘',
  ),
  restAndReflectAction: makeVisual(
    'restAndReflectAction',
    publicPath('images/xiaota/actions/rest-and-reflect.png'),
    CHARACTER_IMAGES.base,
    '休整沉淀行动立绘',
  ),
  stableOperationAction: makeVisual(
    'stableOperationAction',
    publicPath('images/xiaota/actions/stable-operation.png'),
    CHARACTER_IMAGES.base,
    '稳定运营行动立绘',
  ),
  specialSoloWorkAction: makeFallbackVisual(
    'specialSoloWorkAction',
    publicPath('images/xiaota/actions/special-solo-work.png'),
    CHARACTER_IMAGES.happy,
    '个人外务行动立绘',
  ),
  specialIntensiveTrainingAction: makeFallbackVisual(
    'specialIntensiveTrainingAction',
    publicPath('images/xiaota/actions/special-intensive-training.png'),
    CHARACTER_IMAGES.practice,
    '高强度集训行动立绘',
  ),
  specialBirthdaySupportAction: makeFallbackVisual(
    'specialBirthdaySupportAction',
    publicPath('images/xiaota/actions/special-birthday-support.png'),
    CHARACTER_IMAGES.wink,
    '生日应援筹备行动立绘',
  ),
  specialStyleShiftAction: makeFallbackVisual(
    'specialStyleShiftAction',
    publicPath('images/xiaota/actions/special-style-shift.png'),
    CHARACTER_IMAGES.happy,
    '风格转型行动立绘',
  ),
};

export const EVENT_CGS: Record<EventCgKey, CharacterImage> = {
  fanLetterCg: makeVisual(
    'fanLetterCg',
    publicPath('images/xiaota/events/fan-letter.png'),
    CHARACTER_IMAGES.happy,
    '粉丝来信剧情 CG',
  ),
  fanCreationCg: makeVisual(
    'fanCreationCg',
    publicPath('images/xiaota/events/fan-creation.png'),
    CHARACTER_IMAGES.wink,
    '粉丝二创出圈剧情 CG',
  ),
  stageMistakeCg: makeVisual(
    'stageMistakeCg',
    publicPath('images/xiaota/events/stage-mistake.png'),
    CHARACTER_IMAGES.tired,
    '舞台小失误剧情 CG',
  ),
  extraPracticeCg: makeVisual(
    'extraPracticeCg',
    publicPath('images/xiaota/events/extra-practice.png'),
    CHARACTER_IMAGES.practice,
    '练习室加练剧情 CG',
  ),
  styleChallengeCg: makeVisual(
    'styleChallengeCg',
    publicPath('images/xiaota/events/style-challenge.png'),
    CHARACTER_IMAGES.happy,
    '挑战不同风格剧情 CG',
  ),
  summerInviteCg: makeVisual(
    'summerInviteCg',
    publicPath('images/xiaota/events/summer-invite.png'),
    CHARACTER_IMAGES.summer,
    '夏日邀约剧情 CG',
  ),
  lowMoodCg: makeVisual(
    'lowMoodCg',
    publicPath('images/xiaota/events/low-mood.png'),
    CHARACTER_IMAGES.tired,
    '心情低落剧情 CG',
  ),
  secretHappyCg: makeVisual(
    'secretHappyCg',
    publicPath('images/xiaota/events/secret-happy.png'),
    CHARACTER_IMAGES.happy,
    '被夸奖后偷偷开心剧情 CG',
  ),
  dailyMomentCg: makeFallbackVisual(
    'dailyMomentCg',
    publicPath('images/xiaota/events/daily-moment.png'),
    CHARACTER_IMAGES.base,
    '普通但重要的一天剧情 CG',
  ),
};

export const TIMELINE_CGS: Record<TimelineCgKey, CharacterImage> = {
  timeline_x_team_debut: makeTimelineCg(
    'timeline_x_team_debut',
    publicPath('assets/cg/timeline/timeline_x_team_debut.png'),
    'X队初登场 CG',
  ),
  timeline_quick_report_first: makeTimelineCg(
    'timeline_quick_report_first',
    publicPath('assets/cg/timeline/timeline_quick_report_first.png'),
    '冰帝传说 CG',
  ),
  timeline_eighteen_shining_moments: makeTimelineCgPlaceholder(
    'timeline_eighteen_shining_moments',
    publicPath('assets/cg/timeline/timeline_eighteen_shining_moments.png'),
    '十八个闪耀瞬间 CG',
  ),
  timeline_color_girls: makeTimelineCg(
    'timeline_color_girls',
    publicPath('assets/cg/timeline/timeline_color_girls.png'),
    '卡拉卡拉狗 CG',
  ),
  timeline_vice_captain: makeTimelineCg(
    'timeline_vice_captain',
    publicPath('assets/cg/timeline/timeline_vice_captain.png'),
    '肩负旗帜 CG',
  ),
  timeline_demoon: makeTimelineCg(
    'timeline_demoon',
    publicPath('assets/cg/timeline/timeline_demoon.png'),
    'DEMOON CG',
  ),
  timeline_captain: makeTimelineCgPlaceholder(
    'timeline_captain',
    publicPath('assets/cg/timeline/timeline_captain.png'),
    '队长 CG',
  ),
};

export const WORK_CGS: Record<WorkCgKey, CharacterImage> = {
  girls_revolution: makeWorkCg(
    'girls_revolution',
    publicPath('assets/cg/work/work_girls_revolution.png'),
    '少女革命作品 CG',
  ),
  yy_ds: makeCgPlaceholder(
    'yy_ds',
    publicPath('assets/cg/work/work_yy_ds.png'),
    '歪歪DS作品 CG',
  ),
  xiaoyi: makeCgPlaceholder(
    'xiaoyi',
    publicPath('assets/cg/work/work_xiaoyi.png'),
    '小一作品 CG',
  ),
  meteor_stream: makeCgPlaceholder(
    'meteor_stream',
    publicPath('assets/cg/work/work_meteor_stream.png'),
    'meteor stream作品 CG',
  ),
  triones: makeCgPlaceholder(
    'triones',
    publicPath('assets/cg/work/work_triones.png'),
    'Triones作品 CG',
  ),
  fu: makeCgPlaceholder('fu', publicPath('assets/cg/work/work_fu.png'), 'Fu作品 CG'),
  super_tata: makeCgPlaceholder(
    'super_tata',
    publicPath('assets/cg/work/work_super_tata.png'),
    'SuperTATA作品 CG',
  ),
  brand_mark: makeCgPlaceholder(
    'brand_mark',
    publicPath('assets/cg/work/work_brand_mark.png'),
    '烙印作品 CG',
  ),
  flame: makeCgPlaceholder('flame', publicPath('assets/cg/work/work_flame.png'), 'FLAME作品 CG'),
};

export const ANNUAL_CGS: Record<AnnualCgKey, CharacterImage> = {
  election_champion: makeCgPlaceholder(
    'election_champion',
    publicPath('assets/cg/annual/election_champion.png'),
    '总选高光 CG',
  ),
  b50_highlight: makeCgPlaceholder(
    'b50_highlight',
    publicPath('assets/cg/annual/b50_highlight.png'),
    'B50高光 CG',
  ),
};

export const ENDING_CGS: Record<EndingCgKey, CharacterImage> = {
  ending_butterfly: makeEndingCg(
    'ending_butterfly',
    publicPath('assets/cg/ending/ending_butterfly.png'),
    '化茧为蝶结局 CG',
  ),
  ending_spark: makeEndingCg(
    'ending_spark',
    publicPath('assets/cg/ending/ending_spark.png'),
    '星火将燃结局 CG',
  ),
  ending_halfway: makeEndingCg(
    'ending_halfway',
    publicPath('assets/cg/ending/ending_halfway.png'),
    '仍在半山结局 CG',
  ),
  ending_goodnight: makeEndingCg(
    'ending_goodnight',
    publicPath('assets/cg/ending/ending_goodnight.png'),
    '那么晚安结局 CG',
  ),
  ending_risk_pause: makeEndingCg(
    'ending_risk_pause',
    publicPath('assets/cg/ending/ending_risk_pause.png'),
    '暂停休整结局 CG',
  ),
  idolPeakEndingCg: makeEndingCg(
    'idolPeakEndingCg',
    publicPath('images/xiaota/endings/idol-peak.png'),
    '偶像顶点结局 CG',
  ),
  kamiSevenEndingCg: makeEndingCg(
    'kamiSevenEndingCg',
    publicPath('images/xiaota/endings/kami-seven.png'),
    '神七高位结局 CG',
  ),
  top16CoreEndingCg: makeEndingCg(
    'top16CoreEndingCg',
    publicPath('images/xiaota/endings/top16-core.png'),
    'TOP16 稳定核心结局 CG',
  ),
  theaterLegendEndingCg: makeEndingCg(
    'theaterLegendEndingCg',
    publicPath('images/xiaota/endings/theater-legend.png'),
    '剧场传说结局 CG',
  ),
  stageMemoryEndingCg: makeEndingCg(
    'stageMemoryEndingCg',
    publicPath('images/xiaota/endings/stage-memory.png'),
    '舞台记忆结局 CG',
  ),
  fanBondEndingCg: makeEndingCg(
    'fanBondEndingCg',
    publicPath('images/xiaota/endings/fan-bond.png'),
    '粉丝羁绊结局 CG',
  ),
  outsideBreakthroughEndingCg: makeEndingCg(
    'outsideBreakthroughEndingCg',
    publicPath('images/xiaota/endings/outside-breakthrough.png'),
    '外务突破结局 CG',
  ),
  steadyOperationEndingCg: makeEndingCg(
    'steadyOperationEndingCg',
    publicPath('images/xiaota/endings/steady-operation.png'),
    '稳定运营结局 CG',
  ),
  regretGraduationEndingCg: makeEndingCg(
    'regretGraduationEndingCg',
    publicPath('images/xiaota/endings/regret-graduation.png'),
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

  if (type === 'timelineCg') {
    return TIMELINE_CGS[key as TimelineCgKey];
  }

  if (type === 'workCg') {
    return WORK_CGS[key as WorkCgKey];
  }

  if (type === 'annualCg') {
    return ANNUAL_CGS[key as AnnualCgKey];
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

function makeCgPlaceholder(
  key: WorkCgKey | AnnualCgKey,
  plannedSrc: string,
  label: string,
): CharacterImage {
  return {
    key,
    src: publicPath('assets/cg/placeholder.png'),
    plannedSrc,
    alt: label,
    label,
    placeholderText: '视觉资源待补充',
  };
}

function makeWorkCg(key: WorkCgKey, src: string, label: string): CharacterImage {
  return {
    key,
    src,
    plannedSrc: src,
    alt: label,
    label,
  };
}

function makeTimelineCg(key: TimelineCgKey, src: string, label: string): CharacterImage {
  return {
    key,
    src,
    plannedSrc: src,
    alt: label,
    label,
  };
}

function makeTimelineCgPlaceholder(
  key: TimelineCgKey,
  plannedSrc: string,
  label: string,
): CharacterImage {
  return {
    key,
    src: publicPath('assets/cg/placeholder.png'),
    plannedSrc,
    alt: label,
    label,
    placeholderText: '年度主题 CG 待补充',
  };
}
