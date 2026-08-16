---
name: agent-browser-cli
description: 控制你自己那个 Chrome：开标签页、点按钮、读页面、跑 JS。登录态和 Cookie 都还在。
---

# Agent Browser

底层是一个 Rust daemon 加一个 Chrome 扩展桥，驱动的是你日常在用的那个浏览器，不是另起一个干净的实例。

这是它和 Playwright 那类工具的根本差别：需要登录才能看到的页面、挂着插件的页面、你正开着的那个标签页，它都够得着。代价是它只能控制这一台机器上的这个 Chrome。

装完插件还要装 CLI 本身：

    npm i -g @sleepinsummer/agent-browser-cli

然后按它的 README 装上 Chrome 扩展。daemon 是按需拉起的，不用常驻。

## 前置

这个技能驱动的是一个命令行工具，需要先装上：

```bash
npm i -g @sleepinsummer/agent-browser-cli
```

当前上游版本 0.3.7。详细用法见 <https://github.com/sleepinginsummer/agent-browser-cli>。

## 用法

先跑 `agent-browser-cli --help` 看当前版本提供了哪些命令，再按目标选最贴近的那个执行。
不要在每次任务开始时做健康检查——直接执行目标命令，失败了再排查。

## 什么时候用它

- 打开 github.com/trending，把今天前十个仓库的名字和简介列给我
- 在当前这个标签页里把所有外链找出来，标出哪些是 404
- 登录态下把我的订单页截图存到桌面
