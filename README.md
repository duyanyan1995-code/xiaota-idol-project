# 杨小獭偶像养成计划 Demo

一个 React + TypeScript 实现的纯前端单机偶像养成小游戏 Demo。没有后端、登录或真实分享功能，进度和图鉴解锁状态保存在浏览器 `localStorage`。

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

## 如何修改行动数值

编辑 `src/config/actions.ts`。

- 普通行动修改 `deltas`
- 行动次数解锁相关修改 `counters`
- 舞台演出的评分公式修改 `stagePerformance` 的 `getEffect`

## 如何新增随机事件

编辑 `src/config/events.ts`，在 `RANDOM_EVENTS` 数组中新增一项。

每个事件需要：

- `id`
- `title`
- `description`
- `choices`

每个选项可配置 `deltas`，也可以设置 `temporaryState` 或 `summerJoined` 这类状态标记。

## 如何新增图鉴形象

1. 在 `src/types/game.ts` 的 `CharacterImageKey` 增加新 key
2. 在 `src/config/characterImages.ts` 增加图片路径
3. 在 `src/config/gallery.ts` 增加图鉴项和 `isUnlocked` 条件

图鉴解锁状态会保存在 `localStorage`。

## 如何修改结局条件

编辑 `src/config/endings.ts`。

结局按数组顺序匹配，越靠前优先级越高。当前优先级是：

1. 闪耀舞台新星
2. 元气营业小偶像
3. 努力练习生
4. 需要好好休息

