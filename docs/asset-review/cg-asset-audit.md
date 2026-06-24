# CG Asset Audit

Generated for V4 Phase 8 CG接入检查。

## 扫描目录

| path | status | note |
| --- | --- | --- |
| `/Users/aquamoku/Desktop/年度事件cg` | missing | 文档指定目录不存在 |
| `/Users/aquamoku/Desktop/特殊事件cg` | missing | 文档指定目录不存在 |
| `/Users/aquamoku/Desktop/事件cg` | missing | 文档指定目录不存在 |
| `/Users/aquamoku/Desktop/舞台作品cg` | missing | 文档指定目录不存在 |
| `/Users/aquamoku/Desktop/结局cg` | missing | 文档指定目录不存在 |
| `/Users/aquamoku/Desktop/CG` | missing | 文档指定目录不存在 |
| `/Users/aquamoku/Desktop/cg` | missing | 文档指定目录不存在 |
| `/Users/aquamoku/Desktop/FLAME` | missing | 额外检查目录不存在 |
| `/Users/aquamoku/Desktop/年度主题cg` | found | 实际发现的年度主题素材目录 |

## 发现的图片

| folder | imageFile | size | inferredUse | matchedGalleryId | connected | targetPath | needsUserConfirm |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 年度主题cg | `初登场CG.png` | 1086x1448 | X队初登场 | `timeline_x_team_debut` | yes | `public/assets/cg/timeline/timeline_x_team_debut.png` | no |
| 年度主题cg | `速报第一.png` | 1086x1448 | 冰帝传说 / 速报第一 | `timeline_quick_report_first` | yes | `public/assets/cg/timeline/timeline_quick_report_first.png` | no |
| 年度主题cg | `color girls cg.png` | 1086x1448 | 卡拉卡拉狗 / COLOR GIRLS | `timeline_color_girls` | yes | `public/assets/cg/timeline/timeline_color_girls.png` | no |
| 年度主题cg | `成为副队长.png` | 1086x1448 | 肩负旗帜 / 副队长 | `timeline_vice_captain` | yes | `public/assets/cg/timeline/timeline_vice_captain.png` | no |
| 年度主题cg | `demoon cg.png` | 1086x1448 | DEMOON | `timeline_demoon` | yes | `public/assets/cg/timeline/timeline_demoon.png` | no |
| 年度主题cg | `少女革命 cg.png` | 1086x1448 | 少女革命作品 CG | `work_girls_revolution` | yes | `public/assets/cg/work/work_girls_revolution.png` | no |

## 缺图节点

| category | sourceId | galleryId | expectedPath | note |
| --- | --- | --- | --- | --- |
| timeline | `eighteen_shining_moments` | `timeline_eighteen_shining_moments` | `public/assets/cg/timeline/timeline_eighteen_shining_moments.png` | 未找到桌面素材；图鉴显示待补充，主流程不弹占位 |
| timeline | `captain` | `timeline_captain` | `public/assets/cg/timeline/timeline_captain.png` | 未找到桌面素材；图鉴显示待补充，主流程不弹占位 |
| work | `yy_ds` | `work_yy_ds` | `public/assets/cg/work/work_yy_ds.png` | 未找到素材；A/S 不弹占位 |
| work | `xiaoyi` | `work_xiaoyi` | `public/assets/cg/work/work_xiaoyi.png` | 未找到素材；A/S 不弹占位 |
| work | `meteor_stream` | `work_meteor_stream` | `public/assets/cg/work/work_meteor_stream.png` | 未找到素材；A/S 不弹占位 |
| work | `triones` | `work_triones` | `public/assets/cg/work/work_triones.png` | 未找到素材；A/S 不弹占位 |
| work | `fu` | `work_fu` | `public/assets/cg/work/work_fu.png` | 未找到素材；A/S 不弹占位 |
| work | `super_tata` | `work_super_tata` | `public/assets/cg/work/work_super_tata.png` | 未找到素材；A/S 不弹占位 |
| work | `brand_mark` | `work_brand_mark` | `public/assets/cg/work/work_brand_mark.png` | 未找到素材；A/S 不弹占位 |
| work | `flame` | `work_flame` | `public/assets/cg/work/work_flame.png` | 未找到素材；FLAME A/S 不弹占位 |
| ending | `ending_butterfly` | `ending_butterfly` | `public/assets/cg/ending/ending_butterfly.png` | 未找到素材；达成结局不弹占位 |
| ending | `ending_spark` | `ending_spark` | `public/assets/cg/ending/ending_spark.png` | 未找到素材；达成结局不弹占位 |
| ending | `ending_halfway` | `ending_halfway` | `public/assets/cg/ending/ending_halfway.png` | 未找到素材；达成结局不弹占位 |
| ending | `ending_goodnight` | `ending_goodnight` | `public/assets/cg/ending/ending_goodnight.png` | 未找到素材；达成结局不弹占位 |
| ending | `ending_risk_pause` | `ending_risk_pause` | `public/assets/cg/ending/ending_risk_pause.png` | 未找到素材；达成结局不弹占位 |

## 处理结论

- 已接入年度主题 CG 5 张。
- 已接入少女革命作品 CG 1 张。
- 未发现桌面事件 CG、结局 CG、FLAME CG 专门目录。
- 未找到的 CG 均标记为素材未就绪，不在主流程中弹 placeholder。
- 后续补图优先查看 `docs/asset-review/cg-asset-manifest.csv` 的 `expectedImagePath`。
