import { CHARACTER_IMAGES } from './characterImages';
import type {
  ActionVisualKey,
  CharacterImage,
  CharacterImageKey,
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
  key: EventCgKey,
  plannedSrc: string,
  fallback: CharacterImage,
  label: string,
): CharacterImage {
  return makeVisual(key, fallback.src, fallback, label, plannedSrc);
}
