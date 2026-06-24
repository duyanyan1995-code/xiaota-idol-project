# Content Missing Report

本报告由 `scripts/content-review/generate-content-review.mjs` 生成，仅用于盘点。没有替换文案、没有移动图片、没有修改游戏逻辑。

## 1. 缺图清单

| category | visualId | galleryId | expectedImagePath | scene | mainFlowPopup | note |
| --- | --- | --- | --- | --- | --- | --- |
| action | specialSoloWorkAction |  | public/images/xiaota/actions/special-solo-work.png | 行动结果 / Lightbox | 不会 | 使用 legacy fallback，正式行动立绘待补充 |
| action | specialIntensiveTrainingAction |  | public/images/xiaota/actions/special-intensive-training.png | 行动结果 / Lightbox | 不会 | 使用 legacy fallback，正式行动立绘待补充 |
| action | specialBirthdaySupportAction |  | public/images/xiaota/actions/special-birthday-support.png | 行动结果 / Lightbox | 不会 | 使用 legacy fallback，正式行动立绘待补充 |
| action | specialStyleShiftAction |  | public/images/xiaota/actions/special-style-shift.png | 行动结果 / Lightbox | 不会 | 使用 legacy fallback，正式行动立绘待补充 |
| timeline | timeline_eighteen_shining_moments | timeline_eighteen_shining_moments | public/assets/cg/timeline/timeline_eighteen_shining_moments.png | 年度主题CG / CG解锁 / 图鉴 / Lightbox | 不会 | 素材缺失，不在主流程弹 placeholder |
| timeline | timeline_captain | timeline_captain | public/assets/cg/timeline/timeline_captain.png | 年度主题CG / CG解锁 / 图鉴 / Lightbox | 不会 | 素材缺失，不在主流程弹 placeholder |
| work | yy_ds | work_yy_ds | public/assets/cg/work/work_yy_ds.png | 作品CG / CG解锁 / 图鉴 / Lightbox | 不会 | 素材未就绪，不在主流程弹 placeholder |
| work | xiaoyi | work_xiaoyi | public/assets/cg/work/work_xiaoyi.png | 作品CG / CG解锁 / 图鉴 / Lightbox | 不会 | 素材未就绪，不在主流程弹 placeholder |
| work | meteor_stream | work_meteor_stream | public/assets/cg/work/work_meteor_stream.png | 作品CG / CG解锁 / 图鉴 / Lightbox | 不会 | 素材未就绪，不在主流程弹 placeholder |
| work | triones | work_triones | public/assets/cg/work/work_triones.png | 作品CG / CG解锁 / 图鉴 / Lightbox | 不会 | 素材未就绪，不在主流程弹 placeholder |
| work | fu | work_fu | public/assets/cg/work/work_fu.png | 作品CG / CG解锁 / 图鉴 / Lightbox | 不会 | 素材未就绪，不在主流程弹 placeholder |
| work | super_tata | work_super_tata | public/assets/cg/work/work_super_tata.png | 作品CG / CG解锁 / 图鉴 / Lightbox | 不会 | 素材未就绪，不在主流程弹 placeholder |
| work | brand_mark | work_brand_mark | public/assets/cg/work/work_brand_mark.png | 作品CG / CG解锁 / 图鉴 / Lightbox | 不会 | 素材未就绪，不在主流程弹 placeholder |
| work | flame | work_flame | public/assets/cg/work/work_flame.png | 作品CG / CG解锁 / 图鉴 / Lightbox | 不会 | 素材未就绪，不在主流程弹 placeholder |
| event | dailyMomentCg |  | public/images/xiaota/events/daily-moment.png | 普通事件 fallback | 不会 | 普通 fallback，不进入正式图鉴 |
| annual | election_champion | election_champion | public/assets/cg/annual/election_champion.png | 年度节点 / 图鉴预留 | 不会 | 素材未就绪，不在主流程弹 placeholder |
| annual | b50_highlight | b50_highlight | public/assets/cg/annual/b50_highlight.png | 年度节点 / 图鉴预留 | 不会 | 素材未就绪，不在主流程弹 placeholder |
| ending | ending_butterfly | ending_butterfly | public/assets/cg/ending/ending_butterfly.png | 结局页 / 图鉴 / Lightbox | 不会 | 素材未就绪，达成结局不弹 placeholder |
| ending | ending_spark | ending_spark | public/assets/cg/ending/ending_spark.png | 结局页 / 图鉴 / Lightbox | 不会 | 素材未就绪，达成结局不弹 placeholder |
| ending | ending_halfway | ending_halfway | public/assets/cg/ending/ending_halfway.png | 结局页 / 图鉴 / Lightbox | 不会 | 素材未就绪，达成结局不弹 placeholder |
| ending | ending_goodnight | ending_goodnight | public/assets/cg/ending/ending_goodnight.png | 结局页 / 图鉴 / Lightbox | 不会 | 素材未就绪，达成结局不弹 placeholder |
| ending | ending_risk_pause | ending_risk_pause | public/assets/cg/ending/ending_risk_pause.png | 结局页 / 图鉴 / Lightbox | 不会 | 素材未就绪，达成结局不弹 placeholder |
| placeholder | cg_placeholder |  | public/assets/cg/placeholder.png | 缺图占位 | 不会 | 当前文件不存在；缺图项主流程不应弹出该图 |

## 2. 待确认事件 CG 匹配

当前未发现新的桌面事件 CG 候选，本轮待确认事件 CG 数量为 0。

已配置事件 CG 仍沿用历史路径 `public/images/xiaota/events/`。后续如果提供新事件 CG，请按 `docs/asset-review/CG_NAMING_RULES.md` 先补到 `public/assets/cg/event/`，再确认是否迁移配置。

## 3. 疑似硬编码文案

数量：566

| sourceFile | textKey | scene | field | currentText | note |
| --- | --- | --- | --- | --- | --- |
| src/App.tsx | ui.App.line181.1 | 全局流程 / 弹窗 | continueLabel | 继续 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line184.1 | 全局流程 / 弹窗 | title | 本月行动完成 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | event.App.line204.1 | 全局流程 / 弹窗 | title | 事件处理完成 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line249.1 | 全局流程 / 弹窗 | continueLabel | 进入下个月 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line252.1 | 全局流程 / 弹窗 | title | 本月平稳度过 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line253.1 | 全局流程 / 弹窗 | noEventText | 这个月平稳度过，小獭稳稳地完成了自己的节奏。 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line302.1 | 全局流程 / 弹窗 | stringLiteral | 当前阶段需要手动处理 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line328.1 | 全局流程 / 弹窗 | title | 正在推进：${formatYearMonth(result.step.currentYear, result.step.currentMonth)} | 动态模板，保留变量；疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line329.1 | 全局流程 / 弹窗 | subtitle | 普通月份会自动继续，遇到关键节点会停下。 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line364.1 | 全局流程 / 弹窗 | continueLabel | 继续 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line367.1 | 全局流程 / 弹窗 | title | 自动推进摘要 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line368.1 | 全局流程 / 弹窗 | subtitle | 推进了 ${monthCount} 个月 | 动态模板，保留变量；疑似硬编码，修改前确认上下文 |
| src/App.tsx | ending.App.line514.1 | 全局流程 / 弹窗 | label | 结局 CG 解锁 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line516.1 | 全局流程 / 弹窗 | label | 年度主题 CG 解锁 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | event.App.line518.1 | 全局流程 / 弹窗 | label | 事件 CG 解锁 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line519.1 | 全局流程 / 弹窗 | stringLiteral | 图鉴解锁 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ending.App.line521.1 | 全局流程 / 弹窗 | stringLiteral | ${item.name} 已加入结局相册。 | 动态模板，保留变量；疑似硬编码，修改前确认上下文 |
| src/App.tsx | annual.App.line564.1 | 总选结算 | stringLiteral | 继续到总选 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | b50.App.line568.1 | B50结算 | stringLiteral | 继续到 B50 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line572.1 | 全局流程 / 弹窗 | stringLiteral | 继续到年度总结 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | annual.App.line576.1 | 总选结算 | stringLiteral | 继续到最终总选 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line579.1 | 全局流程 / 弹窗 | stringLiteral | 进入下个月 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line480.jsx | 全局流程 / 弹窗 | description | 玩法说明 | 疑似硬编码，修改前确认上下文 |
| src/App.tsx | ui.App.line481.jsx | 全局流程 / 弹窗 | title | 11 年偶像生涯 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line9.1 | 行动选择 | stringLiteral | 舞台 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line9.2 | 行动选择 | stringLiteral | 唱功 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line9.3 | 行动选择 | stringLiteral | 舞蹈 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line10.1 | 行动选择 | stringLiteral | 粉丝 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line10.2 | 行动选择 | stringLiteral | 应援 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line10.3 | 行动选择 | stringLiteral | 魅力 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line11.1 | 行动选择 | stringLiteral | 影响 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line11.2 | 行动选择 | stringLiteral | 资源 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line11.3 | 行动选择 | stringLiteral | 粉丝 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line12.1 | 行动选择 | stringLiteral | 舞台 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line12.2 | 行动选择 | stringLiteral | 舞蹈 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line12.3 | 行动选择 | stringLiteral | 唱功 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line13.1 | 行动选择 | stringLiteral | 魅力 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line13.2 | 行动选择 | stringLiteral | 影响 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line13.3 | 行动选择 | stringLiteral | 粉丝 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line14.1 | 行动选择 | stringLiteral | 体力 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line14.2 | 行动选择 | stringLiteral | 心情 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line14.3 | 行动选择 | stringLiteral | 降压 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line15.1 | 行动选择 | stringLiteral | 应援 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line15.2 | 行动选择 | stringLiteral | 运营 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line15.3 | 行动选择 | stringLiteral | 疲劳↓ | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line19.1 | 行动选择 | stamina | 体力 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line20.1 | 行动选择 | mood | 心情 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line21.1 | 行动选择 | pressure | 压力 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line22.1 | 行动选择 | vocal | 唱功 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line23.1 | 行动选择 | dance | 舞蹈 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line24.1 | 行动选择 | stagePower | 舞台 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line25.1 | 行动选择 | fanCount | 粉丝 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line26.1 | 行动选择 | supportPower | 应援 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line27.1 | 行动选择 | influence | 影响 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line28.1 | 行动选择 | resource | 资源 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line29.1 | 行动选择 | charm | 魅力 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line30.1 | 行动选择 | operation | 运营 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line31.1 | 行动选择 | fanFatigue | 疲劳 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionPanel.tsx | action.components.ActionPanel.line46.1 | 行动选择 | ariaLabel | 本月行动 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionResultCard.tsx | action.components.ActionResultCard.line41.1 | 行动结果 | ariaLabel | 行动结果 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionResultCard.tsx | action.components.ActionResultCard.line87.1 | 行动结果 | stringLiteral | 本月行动： | 疑似硬编码，修改前确认上下文 |
| src/components/ActionResultCard.tsx | action.components.ActionResultCard.line88.1 | 行动结果 | stringLiteral | 本月行动： | 疑似硬编码，修改前确认上下文 |
| src/components/ActionResultCard.tsx | action.components.ActionResultCard.line53.jsx | 行动结果 | jsxText | 行动视觉 | 疑似硬编码，修改前确认上下文 |
| src/components/ActionResultCard.tsx | action.components.ActionResultCard.line54.jsx | 行动结果 | jsxText | 待接入 | 疑似硬编码，修改前确认上下文 |
| src/components/CharacterDisplay.tsx | visual.components.CharacterDisplay.line46.1 | 通用 UI | ariaLabel | 查看大图：${title} | 动态模板，保留变量；疑似硬编码，修改前确认上下文 |
| src/components/CharacterDisplay.tsx | visual.components.CharacterDisplay.line71.1 | 通用 UI | stringLiteral | 杨小獭 | 疑似硬编码，修改前确认上下文 |
| src/components/CharacterDisplay.tsx | visual.components.CharacterDisplay.line77.jsx | 通用 UI | jsxText | 点击查看大图 | 疑似硬编码，修改前确认上下文 |
| src/components/EndingView.tsx | ending.components.EndingView.line48.1 | 结局页 | stringLiteral | 未结算 | 疑似硬编码，修改前确认上下文 |
| src/components/EndingView.tsx | ending.components.EndingView.line52.1 | 结局页 | stringLiteral | 未结算 | 动态模板，保留变量；疑似硬编码，修改前确认上下文 |
| src/components/EndingView.tsx | ending.components.EndingView.line60.1 | 结局页 | stringLiteral | 暂无 | 疑似硬编码，修改前确认上下文 |
| src/components/EndingView.tsx | annual.components.EndingView.line47.jsx | 总选结算 | jsxText | 最终总选 | 疑似硬编码，修改前确认上下文 |
| src/components/EndingView.tsx | ending.components.EndingView.line55.jsx | 结局页 | jsxText | A/S 作品 | 疑似硬编码，修改前确认上下文 |
| src/components/EndingView.tsx | ending.components.EndingView.line59.jsx | 结局页 | jsxText | S 作品 | 疑似硬编码，修改前确认上下文 |
| src/components/EndingView.tsx | annual.components.EndingView.line63.jsx | 总选结算 | jsxText | 最高总选 | 疑似硬编码，修改前确认上下文 |
| src/components/EndingView.tsx | ending.components.EndingView.line67.jsx | B50结算 | jsxText | 最高 B50 | 疑似硬编码，修改前确认上下文 |
| src/components/EndingView.tsx | ending.components.EndingView.line71.jsx | 结局页 | jsxText | 图鉴解锁 | 疑似硬编码，修改前确认上下文 |
| src/components/EndingView.tsx | ending.components.EndingView.line75.jsx | 结局页 | jsxText | 完成时间 | 疑似硬编码，修改前确认上下文 |
| src/components/EndingView.tsx | ending.components.EndingView.line80.jsx | 结局页 | jsxText | 关键达成原因 | 疑似硬编码，修改前确认上下文 |
| src/components/EventModal.tsx | event.components.EventModal.line16.jsx | 通用 UI | description | 随机事件 | 疑似硬编码，修改前确认上下文 |
| src/components/GalleryGrid.tsx | gallery.components.GalleryGrid.line18.1 | 图鉴 | title | 小獭状态 | 疑似硬编码，修改前确认上下文 |
| src/components/GalleryGrid.tsx | gallery.components.GalleryGrid.line19.1 | 图鉴 | description | 日常状态和旧版形象记录 | 疑似硬编码，修改前确认上下文 |
| src/components/GalleryGrid.tsx | event.components.GalleryGrid.line23.1 | 图鉴 | title | 事件回忆 | 疑似硬编码，修改前确认上下文 |
| src/components/GalleryGrid.tsx | event.components.GalleryGrid.line24.1 | 图鉴 | description | 完成剧情事件后解锁的回忆 CG | 疑似硬编码，修改前确认上下文 |
| src/components/GalleryGrid.tsx | gallery.components.GalleryGrid.line28.1 | 图鉴 | title | 年度主题 | 疑似硬编码，修改前确认上下文 |
| src/components/GalleryGrid.tsx | gallery.components.GalleryGrid.line29.1 | 图鉴 | description | 固定年度节点触发后收录的成长 CG | 疑似硬编码，修改前确认上下文 |
| src/components/GalleryGrid.tsx | gallery.components.GalleryGrid.line33.1 | 图鉴 | title | 作品记忆 | 疑似硬编码，修改前确认上下文 |
| src/components/GalleryGrid.tsx | gallery.components.GalleryGrid.line34.1 | 图鉴 | description | 年度作品达到高光后收录的视觉记忆 | 疑似硬编码，修改前确认上下文 |
| src/components/GalleryGrid.tsx | gallery.components.GalleryGrid.line38.1 | 图鉴 | title | 年度节点 | 疑似硬编码，修改前确认上下文 |
| src/components/GalleryGrid.tsx | b50.components.GalleryGrid.line39.1 | 总选结算 | description | 总选和 B50 相关视觉预留 | 疑似硬编码，修改前确认上下文 |
| src/components/GalleryGrid.tsx | gallery.components.GalleryGrid.line43.1 | 图鉴 | title | 结局相册 | 疑似硬编码，修改前确认上下文 |
| src/components/GalleryGrid.tsx | gallery.components.GalleryGrid.line44.1 | 图鉴 | description | 达成终章结局后收录的结局 CG | 疑似硬编码，修改前确认上下文 |
| src/components/GalleryGrid.tsx | gallery.components.GalleryGrid.line88.1 | 图鉴 | stringLiteral | 未解锁 | 疑似硬编码，修改前确认上下文 |
| src/components/GalleryGrid.tsx | gallery.components.GalleryGrid.line89.1 | 图鉴 | stringLiteral | 点击查看详情 | 疑似硬编码，修改前确认上下文 |
| src/components/ImageLightbox.tsx | visual.components.ImageLightbox.line48.1 | CG解锁 / Lightbox | ariaLabel | 关闭大图 | 疑似硬编码，修改前确认上下文 |
| src/components/MonthlySummary.tsx | ui.components.MonthlySummary.line17.1 | 通用 UI | buttonText | 推进中... | 按钮文案，建议短；疑似硬编码，修改前确认上下文 |
| src/components/MonthlySummary.tsx | ui.components.MonthlySummary.line22.1 | 通用 UI | ariaLabel | 本月行动结果 | 疑似硬编码，修改前确认上下文 |
| src/components/MonthlySummary.tsx | ui.components.MonthlySummary.line73.1 | 通用 UI | stringLiteral | 行动 | 疑似硬编码，修改前确认上下文 |
| src/components/MonthlySummary.tsx | event.components.MonthlySummary.line77.1 | 通用 UI | stringLiteral | 事件 | 疑似硬编码，修改前确认上下文 |
| src/components/MonthlySummary.tsx | ui.components.MonthlySummary.line108.1 | 通用 UI | stringLiteral | 本月行动结果 | 疑似硬编码，修改前确认上下文 |
| src/components/MonthlySummary.tsx | event.components.MonthlySummary.line112.1 | 通用 UI | stringLiteral | 本月事件摘要 | 疑似硬编码，修改前确认上下文 |
| src/components/MonthlySummary.tsx | ui.components.MonthlySummary.line116.1 | 通用 UI | stringLiteral | 自动推进中 | 疑似硬编码，修改前确认上下文 |
| src/components/MonthlySummary.tsx | ui.components.MonthlySummary.line119.1 | 通用 UI | stringLiteral | 自动推进摘要 | 疑似硬编码，修改前确认上下文 |
| src/components/MonthlySummary.tsx | ui.components.MonthlySummary.line82.jsx | 通用 UI | jsxText | 变化 | 疑似硬编码，修改前确认上下文 |
| src/components/StatChangeList.tsx | ui.components.StatChangeList.line33.1 | 通用 UI | ariaLabel | 属性变化 | 疑似硬编码，修改前确认上下文 |
| src/components/StatPanel.tsx | status.components.StatPanel.line17.1 | 通用 UI | ariaLabel | 关键状态 | 疑似硬编码，修改前确认上下文 |
| src/components/StatPanel.tsx | status.components.StatPanel.line36.jsx | 通用 UI | description | 状态详情 | 疑似硬编码，修改前确认上下文 |
| src/components/StatPanel.tsx | status.components.StatPanel.line37.jsx | 通用 UI | title | 小獭当前状态 | 疑似硬编码，修改前确认上下文 |
| src/components/StateStage.tsx | status.components.StateStage.line33.1 | 主界面状态区 | ariaLabel | 状态舞台区 | 动态模板，保留变量；疑似硬编码，修改前确认上下文 |
| src/components/StateStage.tsx | status.components.StateStage.line39.1 | 主界面状态区 | ariaLabel | 查看大图：${portrait.alt} | 动态模板，保留变量；疑似硬编码，修改前确认上下文 |
| src/components/StateStage.tsx | status.components.StateStage.line59.1 | 主界面状态区 | ariaLabel | 当前状态标签 | 疑似硬编码，修改前确认上下文 |
| src/components/StateStage.tsx | status.components.StateStage.line66.1 | 主界面状态区 | ariaLabel | 状态提醒 | 疑似硬编码，修改前确认上下文 |
| src/components/StateStage.tsx | status.components.StateStage.line78.1 | 主界面状态区 | stringLiteral | 杨小獭 | 疑似硬编码，修改前确认上下文 |
| src/components/StateStage.tsx | status.components.StateStage.line51.jsx | 主界面状态区 | jsxText | 杨小獭 | 疑似硬编码，修改前确认上下文 |
| src/components/StateStage.tsx | status.components.StateStage.line60.jsx | 主界面状态区 | jsxText | 杨小獭 | 疑似硬编码，修改前确认上下文 |
| src/components/YearTimeline.tsx | ui.components.YearTimeline.line26.1 | 通用 UI | ariaLabel | 年度时间线 | 疑似硬编码，修改前确认上下文 |
| src/components/YearTimeline.tsx | annual.components.YearTimeline.line35.1 | 总选结算 | stringLiteral | 最终总选 | 疑似硬编码，修改前确认上下文 |
| src/components/YearTimeline.tsx | annual.components.YearTimeline.line39.1 | 总选结算 | stringLiteral | 总选 | 疑似硬编码，修改前确认上下文 |
| src/components/YearTimeline.tsx | ui.components.YearTimeline.line44.1 | 通用 UI | ariaLabel | ${state.currentYear} 年月份进度 | 动态模板，保留变量；疑似硬编码，修改前确认上下文 |
| src/components/YearTimeline.tsx | ui.components.YearTimeline.line66.1 | 通用 UI | stringLiteral | 终选 | 疑似硬编码，修改前确认上下文 |
| src/components/YearTimeline.tsx | annual.components.YearTimeline.line66.2 | 总选结算 | stringLiteral | 总选 | 疑似硬编码，修改前确认上下文 |


> 仅预览前 120 条。完整内容见 `player-facing-text-inventory.csv`。


## 4. 未分类图片

数量：0

无。

## 5. 可能重复图片

| group | paths | note |
| --- | --- | --- |
| base.png | public/assets/home/base.png; public/images/xiaota/base.png | 同名图片，未判断内容是否完全相同；不要直接删除 |
| happy.png | public/assets/status/happy.png; public/images/xiaota/happy.png | 同名图片，未判断内容是否完全相同；不要直接删除 |
| tired.png | public/assets/status/tired.png; public/images/xiaota/tired.png | 同名图片，未判断内容是否完全相同；不要直接删除 |

## 6. 处理建议

- 不要直接删除缺图项；先按 `visual-asset-inventory.csv` 的 `expectedImagePath` 补图。
- `assetReady=false` 的 CG 不应该在主流程弹出 placeholder。
- 文案修改优先填写 `player-facing-text-inventory.csv` 的 `revisedText`，不要改 `textKey`。
- 后续统一改文案时，再写单独替换脚本执行，不在本轮处理。
