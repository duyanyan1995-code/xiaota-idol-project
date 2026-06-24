# Content Review

这里是《杨小獭养成计划》V4 内容资产总台账。本目录只做盘点，不改游戏逻辑。

## 文件说明

- `player-facing-text-inventory.csv`：玩家可见文案台账。后续文案总审时，只需要填写 `revisedText`，不要修改 `textKey`。
- `visual-asset-inventory.csv`：图片 / CG / 立绘素材台账。用于查看当前图片在哪里、是否已有素材、后续应该补到哪个路径。
- `scene-content-map.csv`：场景-文案-图片对应关系表。用于查看每个页面或浮层会出现哪些文案和图片。
- `missing-content-report.md`：缺图、待确认素材、疑似硬编码文案、未分类图片和可能重复图片报告。
- `player-facing-text-inventory.md`：文案台账 Markdown 预览。
- `visual-asset-inventory.md`：图片素材台账 Markdown 预览。

## 怎么改文案

1. 打开 `player-facing-text-inventory.csv`。
2. 找到要改的 `textKey`。
3. 只填写 `revisedText`。
4. 不要修改 `category/sourceFile/textKey/scene/field/currentText`。
5. 等文案总审完成后，再单独执行批量替换。

## 怎么补图

1. 打开 `visual-asset-inventory.csv`。
2. 筛选 `assetReady=false` 或 `fileExists=false`。
3. 按 `expectedImagePath` 放入图片。
4. 再更新对应配置里的 assetReady / READY_* 集合。

## 本轮没有做什么

- 没有替换任何文案。
- 没有修改游戏逻辑。
- 没有改数值、结局判定、事件触发或 CG 解锁条件。
- 没有移动或删除图片。

后续补图时优先参考 `expectedImagePath`；后续文案总审时再执行批量替换。
