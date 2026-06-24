# Event CG Mapping

本表用于记录桌面事件 CG 与当前 `src/config/events.ts` 的匹配情况。本轮未发现 `/Users/aquamoku/Desktop/特殊事件cg`、`/Users/aquamoku/Desktop/事件cg` 或其他事件 CG 专门目录，因此没有新增 high confidence 事件 CG 接入。

## 当前事件配置概览

| eventId | type | title | existingGalleryId | action |
| --- | --- | --- | --- | --- |
| `theaterSpotlight` | positive | 剧场小高光 | `extraPracticeCg` | existing_config |
| `warmFanFeedback` | positive | 粉丝反馈热烈 | `fanLetterCg` | existing_config |
| `outsideAttention` | positive | 外部关注 | `fanCreationCg` | existing_config |
| `styleRemembered` | positive | 风格被记住 | `styleChallengeCg` | existing_config |
| `fanBaseStabilized` | positive | 军心稳定 |  | no_cg |
| `trainingOverload` | negative | 训练消耗过度 | `stageMistakeCg` | existing_config |
| `fanServiceFatigue` | negative | 营业疲劳 |  | no_cg |
| `exposurePressure` | negative | 曝光压力 |  | no_cg |
| `styleDebate` | negative | 路线争议 |  | no_cg |
| `staminaOverdraft` | risk | 体力透支 |  | no_cg |
| `pressureImbalance` | risk | 高压失衡 |  | no_cg |
| `supportOverdraft` | risk | 应援盘透支 |  | no_cg |
| `lowMoodSwing` | risk | 状态低落 | `lowMoodCg` | existing_config |
| `quietRecovery` | recovery | 安静恢复日 |  | no_cg |
| `teamAdjustment` | recovery | 团队节奏调整 |  | no_cg |
| `firstThousandFans` | milestone | 第一次千人基本盘 |  | no_cg |
| `stagePowerBreakthrough` | milestone | 舞台力突破 |  | no_cg |

## 桌面事件 CG 匹配结果

| imageFile | inferredEvent | matchedEventId | matchedEventTitle | confidence | suggestedGalleryId | action | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  | unmatched |  | ignored | 未发现桌面事件 CG 文件 |

## 规则说明

- high confidence 才能自动接入：文件名明确包含当前 eventId 或当前事件标题。
- medium / low / unmatched 不复制到正式 `public/assets/cg/event/`。
- 当前已有事件 CG 来自项目历史资源，仍沿用现有配置。
- 普通无 `eventCgKey/galleryId` 事件不会触发 CG。
