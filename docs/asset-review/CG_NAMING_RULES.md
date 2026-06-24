# CG Naming Rules

本规范用于后续补充《杨小獭养成计划》CG 素材。目标是让素材、图鉴 ID、触发节点和代码配置一一对应，避免“看起来能用但后续找不到”的混乱。

## 1. 目录分层

CG 统一放在 `public/assets/cg/` 下，按用途分层：

- `public/assets/cg/timeline/`：年度主题 / 生涯时间线 CG。
- `public/assets/cg/event/`：随机事件 / 特殊事件 CG。
- `public/assets/cg/work/`：年度舞台作品 CG。
- `public/assets/cg/annual/`：总选 / B50 等年度固定节点 CG。
- `public/assets/cg/ending/`：最终结局 CG。

## 2. 文件命名

- 只使用小写英文、数字和下划线。
- 不使用空格、中文、括号、版本说明或日期。
- 文件名必须和 `galleryId` 保持一致。
- 扩展名优先使用 `.png`。如必须使用 `.jpg/.webp`，需要同步修改配置。

示例：

- `timeline_x_team_debut.png`
- `work_girls_revolution.png`
- `ending_butterfly.png`

## 3. 图鉴 ID 规则

- 时间线 CG：`timeline_` + 节点英文 ID。
- 作品 CG：`work_` + 作品英文 ID。
- 年度节点 CG：使用语义 ID，例如 `election_champion`、`b50_highlight`。
- 结局 CG：`ending_` + 结局英文 ID。
- 事件 CG：沿用现有事件 CG key，未来迁移时可使用 snake_case 文件名，但不要改动已存档的 `galleryId`。

## 4. assetReady 规则

- 真实文件已经接入且路径可访问时，`assetReady: true`。
- 文件还没接入时，`assetReady: false`。
- `assetReady: false` 的图鉴项可以显示“待补充”，但主流程不能弹出 placeholder。

## 5. 解锁触发规则

- 时间线 CG：非评分时间线节点触发后，如果 `assetReady: true`，100% 解锁。
- 作品 CG：作品节点达到 A 或 S 时，如果 `assetReady: true`，解锁。
- 事件 CG：玩家完成带 `galleryId` 的事件后，如果 `assetReady: true`，解锁。
- 年度 / 结局 CG：素材未就绪前不自动弹出，后续阶段再接入具体触发。

## 6. 不要用桌面路径

代码和配置里禁止写入 `/Users/.../Desktop/...`。桌面素材必须先复制进 `public/assets/cg/...`，再引用项目内路径。

## 7. 不要覆盖原图

桌面原始图片只读使用，不移动、不删除、不覆盖。项目内复制文件使用规范英文文件名。

## 8. 不确定素材不接入

文件名和节点含义无法高置信匹配时，不复制、不配置，只记录到审计文档中等待确认。

## 9. 一图一用途

同一张 CG 不要同时接到事件、作品和结局多个类别。确实需要复用时，先在审计文档说明原因，再配置。

## 10. 图鉴分类

图鉴分类固定为：

- `timeline`：年度主题
- `event`：事件 CG
- `work`：作品 CG
- `annual`：年度节点
- `ending`：结局 CG
- `character`：旧立绘 / legacy 角色图

## 11. 清单同步

每次新增或替换 CG，必须同步更新：

- `src/config/visualAssets.ts`
- `src/config/gallery.ts`
- `docs/asset-review/cg-asset-manifest.csv`

如果是新事件或新节点，还需要同步对应配置文件。

## 12. 后续缩略图

当前图鉴直接使用原图预览。后续如果图片体积变大，再新增 `thumbnailPath`，目录建议为：

- `public/assets/cg-thumbs/timeline/`
- `public/assets/cg-thumbs/event/`
- `public/assets/cg-thumbs/work/`
- `public/assets/cg-thumbs/annual/`
- `public/assets/cg-thumbs/ending/`
