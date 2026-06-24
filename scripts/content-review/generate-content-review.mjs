import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'docs/content-review');
const SRC_DIR = path.join(ROOT, 'src');
const PUBLIC_DIR = path.join(ROOT, 'public');

const TEXT_HEADER = [
  'category',
  'sourceFile',
  'textKey',
  'scene',
  'field',
  'currentText',
  'revisedText',
  'note',
];

const VISUAL_HEADER = [
  'category',
  'sourceType',
  'sourceId',
  'visualId',
  'galleryId',
  'title',
  'scene',
  'unlockPolicy',
  'assetReady',
  'currentImagePath',
  'expectedImagePath',
  'thumbnailPath',
  'fileExists',
  'usedIn',
  'sourceFile',
  'note',
];

const SCENE_HEADER = [
  'scene',
  'flowStep',
  'trigger',
  'component',
  'sourceFiles',
  'textKeys',
  'visualIds',
  'galleryIds',
  'imagePaths',
  'notes',
];

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const sourceFiles = listFiles(SRC_DIR)
  .filter((file) => /\.(ts|tsx)$/.test(file))
  .filter((file) => !file.endsWith('.d.ts'))
  .map((file) => relative(file))
  .sort();

const textRows = dedupeRows(sourceFiles.flatMap(extractTextRows), TEXT_HEADER);
const visualRows = buildVisualRows();
const sceneRows = buildSceneRows();
const report = buildMissingReport(textRows, visualRows);

writeCsv('player-facing-text-inventory.csv', TEXT_HEADER, textRows);
writeCsv('visual-asset-inventory.csv', VISUAL_HEADER, visualRows);
writeCsv('scene-content-map.csv', SCENE_HEADER, sceneRows);
writeMarkdown('missing-content-report.md', report);
writeMarkdown('README.md', buildReadme());
writeMarkdown('player-facing-text-inventory.md', buildTextPreview(textRows));
writeMarkdown('visual-asset-inventory.md', buildVisualPreview(visualRows));

const summary = {
  textRows: textRows.length,
  visualRows: visualRows.length,
  sceneRows: sceneRows.length,
  textCategories: countBy(textRows, 'category'),
  visualCategories: countBy(visualRows, 'category'),
  missingImages: visualRows.filter((row) => row.fileExists === 'false').length,
  assetReadyFalse: visualRows.filter((row) => row.assetReady === 'false').length,
  fileExistsFalse: visualRows.filter((row) => row.fileExists === 'false').length,
  pendingEventCg: 0,
  unclassifiedImages: findUnclassifiedImages(visualRows).length,
  hardcodedText: textRows.filter((row) => row.note.includes('疑似硬编码')).length,
};

console.log(JSON.stringify(summary, null, 2));

function extractTextRows(sourceFile) {
  const absolute = path.join(ROOT, sourceFile);
  const content = fs.readFileSync(absolute, 'utf8');
  const rows = [];
  const seenAtLine = new Map();
  const stringRegex = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  let match;

  while ((match = stringRegex.exec(content))) {
    const rawText = match[2];
    const currentText = normalizeText(rawText);
    if (!isPlayerFacingText(currentText)) {
      continue;
    }

    const line = lineNumberAt(content, match.index);
    const lineText = getLine(content, line);
    const indexAtLine = (seenAtLine.get(line) ?? 0) + 1;
    seenAtLine.set(line, indexAtLine);
    const category = inferTextCategory(sourceFile, currentText);
    const field = inferField(lineText, currentText);

    rows.push({
      category,
      sourceFile,
      textKey: `${category}.${keyFromSource(sourceFile)}.line${line}.${indexAtLine}`,
      scene: inferScene(sourceFile, currentText),
      field,
      currentText,
      revisedText: '',
      note: inferTextNote(sourceFile, lineText, currentText, field),
    });
  }

  content.split('\n').forEach((lineText, lineIndex) => {
    const jsxRegex = />\s*([^<>{}=;()]{1,80}[\u4e00-\u9fff][^<>{}=;()]{0,120})\s*</g;
    let jsxMatch;
    while ((jsxMatch = jsxRegex.exec(lineText))) {
      const currentText = normalizeText(jsxMatch[1]);
      if (!isPlayerFacingText(currentText)) {
        continue;
      }

      const line = lineIndex + 1;
      if (rows.some((row) => row.sourceFile === sourceFile && row.currentText === currentText && row.textKey.includes(`line${line}.`))) {
        continue;
      }

      const category = inferTextCategory(sourceFile, currentText);
      rows.push({
        category,
        sourceFile,
        textKey: `${category}.${keyFromSource(sourceFile)}.line${line}.jsx`,
        scene: inferScene(sourceFile, currentText),
        field: inferField(lineText, currentText) === 'stringLiteral' ? 'jsxText' : inferField(lineText, currentText),
        currentText,
        revisedText: '',
        note: inferTextNote(sourceFile, lineText, currentText, 'jsxText'),
      });
    }
  });

  return rows;
}

function buildVisualRows() {
  const rows = [];

  rows.push(visualRow({
    category: 'home',
    sourceType: 'home',
    sourceId: 'home',
    visualId: 'home_base',
    title: '杨小獭首页主视觉',
    scene: '首页 / Lightbox',
    unlockPolicy: 'always_visible',
    assetReady: true,
    currentImagePath: 'public/assets/home/base.png',
    expectedImagePath: 'public/assets/home/base.png',
    usedIn: 'HomePage',
    sourceFile: 'src/config/homeVisual.ts',
    note: '首页图，不属于图鉴',
  }));

  for (const [key, title] of [
    ['normal', '普通状态立绘'],
    ['happy', '开心状态立绘'],
    ['tired', '疲惫状态立绘'],
    ['stressed', '高压状态立绘'],
  ]) {
    rows.push(visualRow({
      category: 'status',
      sourceType: 'status',
      sourceId: key,
      visualId: key,
      title,
      scene: '主界面状态立绘 / Lightbox',
      unlockPolicy: 'status_based',
      assetReady: true,
      currentImagePath: `public/assets/status/${key}.png`,
      expectedImagePath: `public/assets/status/${key}.png`,
      usedIn: 'StateStage',
      sourceFile: 'src/config/statusPortraits.ts',
      note: '状态立绘，不属于 CG',
    }));
  }

  for (const item of [
    ['theaterTrainingAction', 'theaterTraining', '剧场加练行动立绘', 'public/images/xiaota/actions/theater-training.png', true],
    ['fanServiceAction', 'fanService', '粉丝营业行动立绘', 'public/images/xiaota/actions/fan-service.png', true],
    ['outsideExposureAction', 'outsideExposure', '外务曝光行动立绘', 'public/images/xiaota/actions/outside-exposure.png', true],
    ['stageFocusAction', 'stageFocus', '舞台专项行动立绘', 'public/images/xiaota/actions/stage-focus.png', true],
    ['imageBuildingAction', 'imageBuilding', '形象经营行动立绘', 'public/images/xiaota/actions/image-building.png', true],
    ['restAndReflectAction', 'restAndReflect', '休整沉淀行动立绘', 'public/images/xiaota/actions/rest-and-reflect.png', true],
    ['stableOperationAction', 'stableOperation', '稳定运营行动立绘', 'public/images/xiaota/actions/stable-operation.png', true],
    ['specialSoloWorkAction', 'specialSoloWork', '个人外务行动立绘', 'public/images/xiaota/actions/special-solo-work.png', false],
    ['specialIntensiveTrainingAction', 'specialIntensiveTraining', '高强度集训行动立绘', 'public/images/xiaota/actions/special-intensive-training.png', false],
    ['specialBirthdaySupportAction', 'specialBirthdaySupport', '生日应援筹备行动立绘', 'public/images/xiaota/actions/special-birthday-support.png', false],
    ['specialStyleShiftAction', 'specialStyleShift', '风格转型行动立绘', 'public/images/xiaota/actions/special-style-shift.png', false],
  ]) {
    const [visualId, sourceId, title, expectedPath, ready] = item;
    rows.push(visualRow({
      category: 'action',
      sourceType: 'action',
      sourceId,
      visualId,
      title,
      scene: '行动结果 / Lightbox',
      unlockPolicy: 'action_result',
      assetReady: ready,
      currentImagePath: ready ? expectedPath : getActionFallbackPath(visualId),
      expectedImagePath: expectedPath,
      usedIn: 'ActionResultCard; ResultModal',
      sourceFile: 'src/config/visualAssets.ts; src/config/plans.ts',
      note: ready ? '已接入' : '使用 legacy fallback，正式行动立绘待补充',
    }));
  }

  for (const key of ['base', 'happy', 'tired', 'wink', 'stage', 'practice', 'summer']) {
    rows.push(visualRow({
      category: 'gallery',
      sourceType: 'gallery',
      sourceId: key,
      visualId: key,
      galleryId: key,
      title: getLegacyTitle(key),
      scene: '图鉴 / legacy fallback / Lightbox',
      unlockPolicy: key === 'base' ? 'always_unlocked' : 'gallery_condition',
      assetReady: true,
      currentImagePath: `public/images/xiaota/${key}.png`,
      expectedImagePath: `public/images/xiaota/${key}.png`,
      usedIn: 'GalleryPage; CharacterDisplay; visual fallback',
      sourceFile: 'src/config/characterImages.ts; src/config/gallery.ts',
      note: '旧立绘 / legacy 角色图',
    }));
  }

  for (const item of [
    ['timeline_x_team_debut', 'x_team_debut', 'X队初登场', true],
    ['timeline_quick_report_first', 'quick_report_first', '冰帝传说', true],
    ['timeline_eighteen_shining_moments', 'eighteen_shining_moments', '十八个闪耀瞬间', false],
    ['timeline_color_girls', 'color_girls', '卡拉卡拉狗', true],
    ['timeline_vice_captain', 'vice_captain', '肩负旗帜', true],
    ['timeline_demoon', 'demoon', 'DEMOON', true],
    ['timeline_captain', 'captain', '队长', false],
  ]) {
    const [galleryId, sourceId, title, ready] = item;
    rows.push(visualRow({
      category: 'timeline',
      sourceType: 'themeNode',
      sourceId,
      visualId: galleryId,
      galleryId,
      title,
      scene: '年度主题CG / CG解锁 / 图鉴 / Lightbox',
      unlockPolicy: 'always_on_node',
      assetReady: ready,
      currentImagePath: ready ? `public/assets/cg/timeline/${galleryId}.png` : 'public/assets/cg/placeholder.png',
      expectedImagePath: `public/assets/cg/timeline/${galleryId}.png`,
      usedIn: 'ThemeNodeCard; VisualUnlockPanel; GalleryPage',
      sourceFile: 'src/config/works.ts; src/config/gallery.ts; src/config/visualAssets.ts',
      note: ready ? '已接入' : '素材缺失，不在主流程弹 placeholder',
    }));
  }

  for (const item of [
    ['work_girls_revolution', 'girls_revolution', '少女革命作品记忆', true],
    ['work_yy_ds', 'yy_ds', '歪歪DS作品记忆', false],
    ['work_xiaoyi', 'xiaoyi', '小一作品记忆', false],
    ['work_meteor_stream', 'meteor_stream', 'meteor stream作品记忆', false],
    ['work_triones', 'triones', 'Triones作品记忆', false],
    ['work_fu', 'fu', 'Fu作品记忆', false],
    ['work_super_tata', 'super_tata', 'SuperTATA作品记忆', false],
    ['work_brand_mark', 'brand_mark', '烙印作品记忆', false],
    ['work_flame', 'flame', 'FLAME终章记忆', false],
  ]) {
    const [galleryId, sourceId, title, ready] = item;
    rows.push(visualRow({
      category: 'work',
      sourceType: 'work',
      sourceId,
      visualId: sourceId,
      galleryId,
      title,
      scene: '作品CG / CG解锁 / 图鉴 / Lightbox',
      unlockPolicy: sourceId === 'flame' ? 'flame_grade_A_or_S' : 'grade_A_or_S',
      assetReady: ready,
      currentImagePath: ready ? `public/assets/cg/work/${galleryId}.png` : 'public/assets/cg/placeholder.png',
      expectedImagePath: `public/assets/cg/work/${galleryId}.png`,
      usedIn: 'WorkNodeCard; VisualUnlockPanel; GalleryPage',
      sourceFile: 'src/config/works.ts; src/config/gallery.ts; src/config/visualAssets.ts',
      note: ready ? '已接入' : '素材未就绪，不在主流程弹 placeholder',
    }));
  }

  for (const item of [
    ['fanLetterCg', 'fanLetter', '粉丝来信 CG', 'fan-letter'],
    ['fanCreationCg', 'fanCreation', '粉丝二创出圈 CG', 'fan-creation'],
    ['stageMistakeCg', 'stageMistake', '舞台小失误 CG', 'stage-mistake'],
    ['extraPracticeCg', 'extraPractice', '练习室加练 CG', 'extra-practice'],
    ['styleChallengeCg', 'styleChallenge', '风格挑战 CG', 'style-challenge'],
    ['summerInviteCg', 'summerInvite', '夏日邀约 CG', 'summer-invite'],
    ['lowMoodCg', 'lowMood', '心情低落 CG', 'low-mood'],
    ['secretHappyCg', 'secretHappy', '偷偷开心 CG', 'secret-happy'],
  ]) {
    const [galleryId, sourceId, title, filename] = item;
    rows.push(visualRow({
      category: 'event',
      sourceType: 'event',
      sourceId,
      visualId: galleryId,
      galleryId,
      title,
      scene: '事件结果 / CG解锁 / 图鉴 / Lightbox',
      unlockPolicy: 'event_resolved',
      assetReady: true,
      currentImagePath: `public/images/xiaota/events/${filename}.png`,
      expectedImagePath: `public/assets/cg/event/${toSnake(galleryId)}.png`,
      usedIn: 'EventCard; ResultModal; VisualUnlockPanel; GalleryPage',
      sourceFile: 'src/config/events.ts; src/config/gallery.ts; src/config/visualAssets.ts',
      note: '沿用历史路径；后续可迁移到 public/assets/cg/event',
    }));
  }

  rows.push(visualRow({
    category: 'event',
    sourceType: 'event',
    sourceId: 'dailyMoment',
    visualId: 'dailyMomentCg',
    title: '普通但重要的一天剧情 CG',
    scene: '普通事件 fallback',
    unlockPolicy: 'fallback_only',
    assetReady: false,
    currentImagePath: 'public/images/xiaota/base.png',
    expectedImagePath: 'public/images/xiaota/events/daily-moment.png',
    usedIn: 'visual fallback',
    sourceFile: 'src/config/visualAssets.ts',
    note: '普通 fallback，不进入正式图鉴',
  }));

  for (const item of [
    ['election_champion', 'election', '总选高光记忆'],
    ['b50_highlight', 'b50', 'B50高光记忆'],
  ]) {
    const [galleryId, sourceId, title] = item;
    rows.push(visualRow({
      category: 'annual',
      sourceType: 'annual',
      sourceId,
      visualId: galleryId,
      galleryId,
      title,
      scene: '年度节点 / 图鉴预留',
      unlockPolicy: 'annual_result',
      assetReady: false,
      currentImagePath: 'public/assets/cg/placeholder.png',
      expectedImagePath: `public/assets/cg/annual/${galleryId}.png`,
      usedIn: 'GalleryPage; visual placeholder',
      sourceFile: 'src/config/gallery.ts; src/config/visualAssets.ts',
      note: '素材未就绪，不在主流程弹 placeholder',
    }));
  }

  for (const item of [
    ['ending_butterfly', '化茧为蝶结局 CG'],
    ['ending_spark', '星火将燃结局 CG'],
    ['ending_halfway', '仍在半山结局 CG'],
    ['ending_goodnight', '那么晚安结局 CG'],
    ['ending_risk_pause', '暂停休整结局 CG'],
  ]) {
    const [galleryId, title] = item;
    rows.push(visualRow({
      category: 'ending',
      sourceType: 'ending',
      sourceId: galleryId,
      visualId: galleryId,
      galleryId,
      title,
      scene: '结局页 / 图鉴 / Lightbox',
      unlockPolicy: 'ending_reached',
      assetReady: false,
      currentImagePath: `public/assets/cg/ending/${galleryId}.png`,
      expectedImagePath: `public/assets/cg/ending/${galleryId}.png`,
      usedIn: 'EndingPage; GalleryPage',
      sourceFile: 'src/config/finalEndings.ts; src/config/gallery.ts; src/config/visualAssets.ts',
      note: '素材未就绪，达成结局不弹 placeholder',
    }));
  }

  rows.push(visualRow({
    category: 'placeholder',
    sourceType: 'placeholder',
    sourceId: 'cg_placeholder',
    visualId: 'cg_placeholder',
    title: 'CG placeholder',
    scene: '缺图占位',
    unlockPolicy: 'asset_placeholder',
    assetReady: false,
    currentImagePath: 'public/assets/cg/placeholder.png',
    expectedImagePath: 'public/assets/cg/placeholder.png',
    usedIn: 'visualAssets placeholder fallback',
    sourceFile: 'src/config/visualAssets.ts',
    note: '当前文件不存在；缺图项主流程不应弹出该图',
  }));

  return rows;
}

function buildSceneRows() {
  return [
    sceneRow('首页', 'home', '进入首页', 'HomePage', ['src/pages/HomePage.tsx', 'src/config/homeVisual.ts'], ['ui.homepage', 'ui.button.start', 'ui.button.continue', 'ui.button.gallery'], ['home_base'], [], ['public/assets/home/base.png'], '首页主视觉支持普通 CharacterDisplay；不属于图鉴'),
    sceneRow('主界面', 'month_start', '进入月份开始', 'GamePage; StateStage; YearTimeline; StatPanel', ['src/pages/GamePage.tsx', 'src/components/StateStage.tsx', 'src/components/YearTimeline.tsx', 'src/components/StatPanel.tsx'], ['ui.game.header', 'status.main_state', 'status.tendency'], ['normal;happy;tired;stressed'], [], ['public/assets/status/*.png'], '状态立绘支持 Lightbox'),
    sceneRow('行动选择', 'action_select', '点击安排本月行动', 'ActionPanel', ['src/components/ActionPanel.tsx', 'src/config/plans.ts', 'src/config/actionVariants.ts'], ['action.*.name', 'action.*.description', 'action.*.variant'], ['theaterTrainingAction;fanServiceAction;outsideExposureAction;stageFocusAction'], [], ['public/images/xiaota/actions/*.png'], '行动卡只展示短标签，variant 在结果展示'),
    sceneRow('行动结果', 'action_result', '行动结算完成', 'ActionResultCard; ResultModal', ['src/components/ActionResultCard.tsx', 'src/config/plans.ts', 'src/config/visualAssets.ts'], ['action.*.feedbackText', 'action.*.variant'], ['actionVisualKey'], [], ['public/images/xiaota/actions/*.png'], '行动立绘支持 Lightbox，不进图鉴'),
    sceneRow('事件浮层', 'event_pending', '事件触发', 'EventCard; ResultModal', ['src/pages/GamePage.tsx', 'src/config/events.ts'], ['event.*.title', 'event.*.choice.*.resultText'], ['eventCgKey'], ['fanLetterCg;fanCreationCg;stageMistakeCg;extraPracticeCg;styleChallengeCg;summerInviteCg;lowMoodCg;secretHappyCg'], ['public/images/xiaota/events/*.png'], '事件选择页不显示 CG，事件结果页显示 CG'),
    sceneRow('年度主题节点', 'theme_node', '到达固定年月', 'ThemeNodeCard', ['src/config/works.ts', 'src/pages/GamePage.tsx'], ['theme.timeline.*.title', 'theme.timeline.*.description'], ['timeline_*'], ['timeline_*'], ['public/assets/cg/timeline/*.png'], 'assetReady=true 才弹 CG 解锁；缺图不弹 placeholder'),
    sceneRow('作品节点', 'work_result', '到达作品节点并评分', 'WorkNodeCard', ['src/config/works.ts', 'src/utils/workLogic.ts'], ['work.*.title', 'work.grade.*.narrative'], ['work_*'], ['work_*'], ['public/assets/cg/work/*.png'], 'A/S 且 assetReady=true 才解锁作品 CG'),
    sceneRow('总选结算', 'annual_result', '总选月结算', 'ResultModal', ['src/config/annualResults.ts', 'src/utils/resultDisplay.ts', 'src/utils/gameLogic.ts'], ['annual.election.*.label', 'annual.election.*.narrative'], ['election_champion'], ['election_champion'], ['public/assets/cg/annual/election_champion.png'], '年度 CG 当前预留，素材未就绪'),
    sceneRow('B50结算', 'annual_result', 'B50 月结算', 'ResultModal', ['src/config/annualResults.ts', 'src/utils/resultDisplay.ts', 'src/utils/gameLogic.ts'], ['b50.*.label', 'b50.*.narrative'], ['b50_highlight'], ['b50_highlight'], ['public/assets/cg/annual/b50_highlight.png'], '年度 CG 当前预留，素材未就绪'),
    sceneRow('年度总结', 'year_summary', '年末总结', 'YearSummaryPanel', ['src/pages/GamePage.tsx', 'src/utils/gameLogic.ts'], ['ui.year_summary.*'], [], [], [], '总结文本多为动态拼接，文案变更需谨慎保留变量'),
    sceneRow('CG解锁浮层', 'visual_unlock', '视觉记忆解锁', 'VisualUnlockCard; GalleryUnlockModal', ['src/pages/GamePage.tsx', 'src/App.tsx', 'src/config/gallery.ts'], ['visual.unlock.title', 'gallery.*.description'], ['timeline_*;work_*;eventCgKey;ending_*'], ['timeline_*;work_*;eventCgKey;ending_*'], ['public/assets/cg/**/*.png; public/images/xiaota/events/*.png'], '支持 Lightbox；缺图项不应在主流程弹出'),
    sceneRow('图鉴', 'gallery', '点击图鉴', 'GalleryPage; GalleryGrid', ['src/pages/GalleryPage.tsx', 'src/components/GalleryGrid.tsx', 'src/config/gallery.ts'], ['gallery.category.*', 'gallery.*.name', 'gallery.*.description'], ['all gallery visuals'], ['GALLERY_ITEMS.id'], ['public/assets/**; public/images/**'], '已解锁详情图支持 Lightbox；未解锁不显示真实图'),
    sceneRow('Lightbox', 'image_preview', '点击可放大图片', 'ImageLightbox; CharacterDisplay', ['src/components/ImageLightbox.tsx', 'src/components/CharacterDisplay.tsx'], ['visual.lightbox.close', 'visual.lightbox.zoomHint'], ['current image'], [], [], '只做 UI 临时状态，不写入存档'),
    sceneRow('FLAME终章', 'flame_prelude', '2025 年 12 月后', 'GamePage; WorkNodeCard', ['src/config/works.ts', 'src/utils/finalChapterLogic.ts', 'src/utils/gameLogic.ts'], ['flame.*', 'work.flame.*'], ['work_flame'], ['work_flame'], ['public/assets/cg/work/work_flame.png'], '当前 FLAME CG 缺图，不弹 placeholder'),
    sceneRow('最终总选', 'final_election', '2026 终章最终总选', 'ResultModal', ['src/utils/finalChapterLogic.ts', 'src/pages/GamePage.tsx'], ['flame.finalElection.*'], [], [], [], '公式和文案不在本轮修改'),
    sceneRow('结局页', 'ending_result', '结局达成', 'EndingPage; EndingView', ['src/pages/EndingPage.tsx', 'src/components/EndingView.tsx', 'src/config/finalEndings.ts'], ['ending.*.title', 'ending.*.subtitle', 'ending.*.narrative'], ['ending_*'], ['ending_*'], ['public/assets/cg/ending/*.png'], '结局 CG 当前缺图，页面支持 Lightbox 但不会弹错图'),
    sceneRow('自动推进', 'auto_advance', '点击自动推进到关键节点', 'App; MonthlySummary', ['src/App.tsx', 'src/components/MonthlySummary.tsx', 'src/utils/autoAdvanceLogic.ts'], ['ui.auto_advance.*'], [], [], [], '低打断推进摘要，普通事件不弹 CG'),
    sceneRow('玩法说明', 'guide', '点击玩法说明', 'App', ['src/App.tsx'], ['ui.guide.*'], [], [], [], '纯文案弹窗'),
  ];
}

function visualRow(input) {
  const currentExists = input.currentImagePath ? fileExists(input.currentImagePath) : false;
  return {
    category: input.category,
    sourceType: input.sourceType,
    sourceId: input.sourceId ?? '',
    visualId: input.visualId ?? '',
    galleryId: input.galleryId ?? '',
    title: input.title,
    scene: input.scene,
    unlockPolicy: input.unlockPolicy,
    assetReady: String(Boolean(input.assetReady)),
    currentImagePath: input.currentImagePath ?? '',
    expectedImagePath: input.expectedImagePath ?? input.currentImagePath ?? '',
    thumbnailPath: input.thumbnailPath ?? '',
    fileExists: String(currentExists),
    usedIn: input.usedIn,
    sourceFile: input.sourceFile,
    note: input.note ?? '',
  };
}

function sceneRow(scene, flowStep, trigger, component, sourceFiles, textKeys, visualIds, galleryIds, imagePaths, notes) {
  return {
    scene,
    flowStep,
    trigger,
    component,
    sourceFiles: sourceFiles.join(';'),
    textKeys: textKeys.join(';'),
    visualIds: visualIds.join(';'),
    galleryIds: galleryIds.join(';'),
    imagePaths: imagePaths.join(';'),
    notes,
  };
}

function buildMissingReport(textRows, visualRows) {
  const missingImages = visualRows.filter((row) => row.fileExists === 'false' || row.assetReady === 'false');
  const unclassified = findUnclassifiedImages(visualRows);
  const hardcoded = textRows.filter((row) => row.note.includes('疑似硬编码'));
  const duplicateCandidates = findDuplicateCandidates();

  return `# Content Missing Report

本报告由 \`scripts/content-review/generate-content-review.mjs\` 生成，仅用于盘点。没有替换文案、没有移动图片、没有修改游戏逻辑。

## 1. 缺图清单

${markdownTable(
  ['category', 'visualId', 'galleryId', 'expectedImagePath', 'scene', 'mainFlowPopup', 'note'],
  missingImages.map((row) => [
    row.category,
    row.visualId,
    row.galleryId,
    row.expectedImagePath,
    row.scene,
    shouldPopupInMainFlow(row) ? '可能' : '不会',
    row.note,
  ]),
)}

## 2. 待确认事件 CG 匹配

当前未发现新的桌面事件 CG 候选，本轮待确认事件 CG 数量为 0。

已配置事件 CG 仍沿用历史路径 \`public/images/xiaota/events/\`。后续如果提供新事件 CG，请按 \`docs/asset-review/CG_NAMING_RULES.md\` 先补到 \`public/assets/cg/event/\`，再确认是否迁移配置。

## 3. 疑似硬编码文案

数量：${hardcoded.length}

${markdownTable(
  ['sourceFile', 'textKey', 'scene', 'field', 'currentText', 'note'],
  hardcoded.slice(0, 120).map((row) => [
    row.sourceFile,
    row.textKey,
    row.scene,
    row.field,
    row.currentText,
    row.note,
  ]),
)}

${hardcoded.length > 120 ? `\n> 仅预览前 120 条。完整内容见 \`player-facing-text-inventory.csv\`。\n` : ''}

## 4. 未分类图片

数量：${unclassified.length}

${markdownTable(['path', 'note'], unclassified.map((item) => [item, 'public 中存在，但未进入 visual-asset-inventory.csv']))}

## 5. 可能重复图片

${duplicateCandidates.length > 0
  ? markdownTable(['group', 'paths', 'note'], duplicateCandidates.map((item) => [item.group, item.paths.join('; '), item.note]))
  : '未发现需要立即处理的重复图片。'}

## 6. 处理建议

- 不要直接删除缺图项；先按 \`visual-asset-inventory.csv\` 的 \`expectedImagePath\` 补图。
- \`assetReady=false\` 的 CG 不应该在主流程弹出 placeholder。
- 文案修改优先填写 \`player-facing-text-inventory.csv\` 的 \`revisedText\`，不要改 \`textKey\`。
- 后续统一改文案时，再写单独替换脚本执行，不在本轮处理。
`;
}

function buildReadme() {
  return `# Content Review

这里是《杨小獭养成计划》V4 内容资产总台账。本目录只做盘点，不改游戏逻辑。

## 文件说明

- \`player-facing-text-inventory.csv\`：玩家可见文案台账。后续文案总审时，只需要填写 \`revisedText\`，不要修改 \`textKey\`。
- \`visual-asset-inventory.csv\`：图片 / CG / 立绘素材台账。用于查看当前图片在哪里、是否已有素材、后续应该补到哪个路径。
- \`scene-content-map.csv\`：场景-文案-图片对应关系表。用于查看每个页面或浮层会出现哪些文案和图片。
- \`missing-content-report.md\`：缺图、待确认素材、疑似硬编码文案、未分类图片和可能重复图片报告。
- \`player-facing-text-inventory.md\`：文案台账 Markdown 预览。
- \`visual-asset-inventory.md\`：图片素材台账 Markdown 预览。

## 怎么改文案

1. 打开 \`player-facing-text-inventory.csv\`。
2. 找到要改的 \`textKey\`。
3. 只填写 \`revisedText\`。
4. 不要修改 \`category/sourceFile/textKey/scene/field/currentText\`。
5. 等文案总审完成后，再单独执行批量替换。

## 怎么补图

1. 打开 \`visual-asset-inventory.csv\`。
2. 筛选 \`assetReady=false\` 或 \`fileExists=false\`。
3. 按 \`expectedImagePath\` 放入图片。
4. 再更新对应配置里的 assetReady / READY_* 集合。

## 本轮没有做什么

- 没有替换任何文案。
- 没有修改游戏逻辑。
- 没有改数值、结局判定、事件触发或 CG 解锁条件。
- 没有移动或删除图片。

后续补图时优先参考 \`expectedImagePath\`；后续文案总审时再执行批量替换。
`;
}

function buildTextPreview(rows) {
  const preview = rows.slice(0, 120).map((row) => [
    row.category,
    row.sourceFile,
    row.textKey,
    row.scene,
    row.field,
    row.currentText,
    row.note,
  ]);

  return `# Player Facing Text Inventory Preview

完整 CSV：\`player-facing-text-inventory.csv\`

总条数：${rows.length}

${markdownTable(['category', 'sourceFile', 'textKey', 'scene', 'field', 'currentText', 'note'], preview)}

${rows.length > 120 ? `\n> 仅预览前 120 条。\n` : ''}
`;
}

function buildVisualPreview(rows) {
  return `# Visual Asset Inventory Preview

完整 CSV：\`visual-asset-inventory.csv\`

总条数：${rows.length}

${markdownTable(
  ['category', 'sourceId', 'visualId', 'galleryId', 'title', 'assetReady', 'fileExists', 'currentImagePath', 'expectedImagePath', 'note'],
  rows.map((row) => [
    row.category,
    row.sourceId,
    row.visualId,
    row.galleryId,
    row.title,
    row.assetReady,
    row.fileExists,
    row.currentImagePath,
    row.expectedImagePath,
    row.note,
  ]),
)}
`;
}

function inferTextCategory(sourceFile, text) {
  if (sourceFile.includes('plans') || sourceFile.includes('actionVariants') || sourceFile.includes('ActionPanel') || sourceFile.includes('ActionResult')) {
    return 'action';
  }
  if (sourceFile.includes('events') || sourceFile.includes('eventLogic') || text.includes('事件')) {
    return 'event';
  }
  if (sourceFile.includes('annualResults') || sourceFile.includes('resultDisplay') || text.includes('总选') || text.includes('年度人气')) {
    return text.includes('B50') ? 'b50' : 'annual';
  }
  if (sourceFile.includes('works')) {
    return text.includes('FLAME') ? 'flame' : text.includes('节点') ? 'theme' : 'work';
  }
  if (sourceFile.includes('gallery') || sourceFile.includes('Gallery')) {
    return 'gallery';
  }
  if (sourceFile.includes('visualAssets') || sourceFile.includes('ImageLightbox') || sourceFile.includes('CharacterDisplay')) {
    return 'visual';
  }
  if (sourceFile.includes('status') || sourceFile.includes('StateStage') || sourceFile.includes('StatPanel')) {
    return 'status';
  }
  if (sourceFile.includes('finalEndings') || sourceFile.includes('Ending') || text.includes('结局')) {
    return 'ending';
  }
  if (text.includes('FLAME') || text.includes('终章')) {
    return 'flame';
  }
  if (text.includes('B50')) {
    return 'b50';
  }
  if (text.includes('系统') || text.includes('无法') || text.includes('错误')) {
    return 'system';
  }
  return 'ui';
}

function inferScene(sourceFile, text) {
  if (sourceFile.includes('HomePage')) return '首页';
  if (sourceFile.includes('ActionPanel')) return '行动选择';
  if (sourceFile.includes('ActionResult')) return '行动结果';
  if (sourceFile.includes('events')) return '事件浮层';
  if (sourceFile.includes('annualResults') || text.includes('总选')) return '总选结算';
  if (text.includes('B50')) return 'B50结算';
  if (sourceFile.includes('works')) return text.includes('FLAME') ? 'FLAME终章' : '年度主题节点 / 作品节点';
  if (sourceFile.includes('gallery') || sourceFile.includes('Gallery')) return '图鉴';
  if (sourceFile.includes('visualAssets') || sourceFile.includes('ImageLightbox')) return 'CG解锁 / Lightbox';
  if (sourceFile.includes('StateStage') || sourceFile.includes('status')) return '主界面状态区';
  if (sourceFile.includes('Ending') || sourceFile.includes('finalEndings')) return '结局页';
  if (sourceFile.includes('GamePage')) return '主界面 / 流程浮层';
  if (sourceFile.includes('App.tsx')) return '全局流程 / 弹窗';
  return '通用 UI';
}

function inferField(lineText, text) {
  const propertyMatch = lineText.match(/([A-Za-z0-9_]+)\s*:\s*(['"`])/);
  if (propertyMatch) {
    return propertyMatch[1];
  }
  if (lineText.includes('<button') || lineText.includes('button')) {
    return 'buttonText';
  }
  if (lineText.includes('aria-label')) {
    return 'ariaLabel';
  }
  if (lineText.includes('<h1') || lineText.includes('<h2') || lineText.includes('<h3')) {
    return 'title';
  }
  if (lineText.includes('<p')) {
    return 'description';
  }
  if (text.includes('CG') || text.includes('立绘')) {
    return 'label';
  }
  return 'stringLiteral';
}

function inferTextNote(sourceFile, lineText, text, field) {
  const notes = [];
  if (text.includes('${') || lineText.includes('`')) notes.push('动态模板，保留变量');
  if (field === 'buttonText') notes.push('按钮文案，建议短');
  if (sourceFile.includes('finalEndings')) notes.push('结局名/结局正文，谨慎修改');
  if (sourceFile.includes('config/')) notes.push('配置文案，可改');
  if (sourceFile.includes('utils/') || sourceFile.includes('components/') || sourceFile.includes('pages/') || sourceFile === 'src/App.tsx') {
    notes.push('疑似硬编码，修改前确认上下文');
  }
  if (text.includes('待补充') || text.includes('placeholder') || text.includes('缺失')) notes.push('缺图/占位提示');
  return notes.length > 0 ? notes.join('；') : '可改';
}

function keyFromSource(sourceFile) {
  return sourceFile
    .replace(/^src\//, '')
    .replace(/\.(ts|tsx)$/, '')
    .replace(/[^A-Za-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

function isPlayerFacingText(text) {
  if (!text || text.length < 2) return false;
  if (!/[\u4e00-\u9fff]/.test(text)) return false;
  if (text.startsWith('src/')) return false;
  return true;
}

function normalizeText(text) {
  return text
    .replace(/\\n/g, ' ')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function getActionFallbackPath(visualId) {
  const fallback = {
    specialSoloWorkAction: 'public/images/xiaota/happy.png',
    specialIntensiveTrainingAction: 'public/images/xiaota/practice.png',
    specialBirthdaySupportAction: 'public/images/xiaota/wink.png',
    specialStyleShiftAction: 'public/images/xiaota/happy.png',
  };
  return fallback[visualId] ?? '';
}

function getLegacyTitle(key) {
  const titles = {
    base: '初始主形象',
    happy: '开心版',
    tired: '疲惫版',
    wink: 'wink 营业版',
    stage: '舞台服版',
    practice: '练习服版',
    summer: '夏日版',
  };
  return titles[key] ?? key;
}

function shouldPopupInMainFlow(row) {
  if (row.assetReady !== 'true') return false;
  return ['timeline', 'work', 'event', 'ending'].includes(row.category);
}

function fileExists(publicPath) {
  if (!publicPath) return false;
  const cleanPath = publicPath.replace(/\?.*$/, '');
  const absolutePath = cleanPath.startsWith('public/')
    ? path.join(ROOT, cleanPath)
    : path.join(PUBLIC_DIR, cleanPath);
  return fs.existsSync(absolutePath);
}

function findUnclassifiedImages(visualRows) {
  const listed = new Set();
  for (const row of visualRows) {
    for (const field of ['currentImagePath', 'expectedImagePath', 'thumbnailPath']) {
      const value = row[field];
      if (value?.startsWith('public/')) {
        listed.add(value.replace(/\?.*$/, ''));
      }
    }
  }

  return listFiles(PUBLIC_DIR)
    .map((file) => relative(file))
    .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
    .filter((file) => !listed.has(file))
    .sort();
}

function findDuplicateCandidates() {
  const publicImages = listFiles(PUBLIC_DIR)
    .map((file) => relative(file))
    .filter((file) => /\.(png|jpe?g|webp)$/i.test(file));
  const byBase = new Map();
  for (const image of publicImages) {
    const base = path.basename(image).toLowerCase();
    const list = byBase.get(base) ?? [];
    list.push(image);
    byBase.set(base, list);
  }

  return [...byBase.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([group, paths]) => ({
      group,
      paths,
      note: '同名图片，未判断内容是否完全相同；不要直接删除',
    }));
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...listFiles(fullPath));
    } else if (entry.isFile()) {
      result.push(fullPath);
    }
  }
  return result;
}

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function lineNumberAt(content, index) {
  return content.slice(0, index).split('\n').length;
}

function getLine(content, lineNumber) {
  return content.split('\n')[lineNumber - 1] ?? '';
}

function toSnake(value) {
  return value.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`).replace(/^_/, '');
}

function dedupeRows(rows, header) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = header.map((field) => row[field]).join('\u0001');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function writeCsv(filename, header, rows) {
  const csv = [header.join(','), ...rows.map((row) => header.map((field) => csvCell(row[field] ?? '')).join(','))].join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), `${csv}\n`, 'utf8');
}

function writeMarkdown(filename, content) {
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), content, 'utf8');
}

function csvCell(value) {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function markdownTable(header, rows) {
  if (rows.length === 0) {
    return '无。';
  }
  const safeRows = rows.map((row) => row.map(markdownCell));
  return [
    `| ${header.map(markdownCell).join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...safeRows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');
}

function markdownCell(value) {
  return String(value ?? '').replace(/\|/g, '/').replace(/\n/g, '<br>');
}

function countBy(rows, field) {
  return rows.reduce((result, row) => {
    const key = row[field] || 'unknown';
    result[key] = (result[key] ?? 0) + 1;
    return result;
  }, {});
}
