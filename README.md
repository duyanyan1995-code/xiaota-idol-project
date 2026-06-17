# 杨小獭偶像养成计划 Demo

一个 React + TypeScript 实现的纯前端单机偶像养成小游戏 Demo。当前版本是 V2 第一阶段的 11 年偶像生涯模式：每年选择上半年计划、处理事件、结算总选，再选择下半年计划、处理事件、结算 B50，完成年度总结后进入下一年。没有后端、登录或真实分享功能，进度和图鉴解锁状态保存在浏览器 `localStorage`。

## 如何运行项目

```bash
npm install
npm run dev
```

构建检查：

```bash
npm run build
```

## 如何替换图片

角色图片路径集中在 `src/config/characterImages.ts`。

默认读取：

```text
public/images/xiaota/base.png
public/images/xiaota/happy.png
public/images/xiaota/tired.png
public/images/xiaota/wink.png
public/images/xiaota/stage.png
public/images/xiaota/practice.png
public/images/xiaota/summer.png
```

如果图片不存在，页面会显示内置占位图，不会报错。

## 如何修改计划数值

编辑 `src/config/plans.ts`。

- `effects` 控制半年计划带来的属性变化
- `riskTags` 控制计划卡片的风险标签
- `feedbackText` 控制选择计划后的反馈文案

B50 和总选节点的评分、奖励逻辑在 `src/utils/nodeLogic.ts`。

## 如何新增随机事件

编辑 `src/config/events.ts`，在 `RANDOM_EVENTS` 数组中新增一项。

每个事件需要：

- `id`
- `title`
- `description`
- `choices`

每个选项可配置 `effects`，也可以设置 `flags`、`b50Bonus` 或 `electionBonus`。

## 如何新增图鉴形象

1. 在 `src/types/game.ts` 的 `CharacterImageKey` 增加新 key
2. 在 `src/config/characterImages.ts` 增加图片路径
3. 在 `src/config/gallery.ts` 增加图鉴项和 `isUnlocked` 条件

图鉴解锁状态会保存在 `localStorage`。

## 如何修改结局条件

编辑 `src/config/endings.ts`。

结局按数组顺序匹配，越靠前优先级越高。当前优先级是：

1. 顶点偶像
2. 舞台传说
3. 粉丝心中的小太阳
4. 可瓜可花全能偶像
5. 努力派剧场支柱
6. 长期陪伴型偶像
7. 短暂闪光
8. 需要好好休息
9. 普通完成结局
