# Lyra Plugins

[Lyra](https://github.com/kittors/Lyra) 的插件市场。每天从上游同步一次版本。

## 加到 Lyra 里

侧边栏 →「插件」→ 右上角「添加」→「添加插件市场」，填：

```
https://raw.githubusercontent.com/kittors/Lyra-Plugins/main/registry.json
```

## 现在有什么

| | 插件 | 上游 | 做什么 |
| --- | --- | --- | --- |
| 浏览器 | Agent Browser | [sleepinginsummer/agent-browser-cli](https://github.com/sleepinginsummer/agent-browser-cli) | 控制你自己那个 Chrome，登录态还在 |
| 浏览器 | Playwright | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | 用无障碍树驱动浏览器，读结构不读像素 |
| 浏览器 | Chrome DevTools | [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | 性能追踪、网络请求、控制台 |
| 本机 | Desktop Commander | [wonderwhy-er/DesktopCommanderMCP](https://github.com/wonderwhy-er/DesktopCommanderMCP) | 跑命令、编辑文件、管进程 |
| 本机 | Filesystem | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) | 只在点名的目录里读写 |
| 开发 | Context7 | [upstash/context7](https://github.com/upstash/context7) | 取库的当前文档 |
| 开发 | Waza | [tw93/Waza](https://github.com/tw93/Waza) | 八件工程老规矩，写成能执行的流程 |
| 思考 | Sequential Thinking | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking) | 允许走回头路的分步思考 |
| 思考 | Memory | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/memory) | 跨会话的知识图谱 |

## 这个仓库是镜子，不是仓库

每一条都是别人的东西，而且别人还在改。所以这里存的是**没法从上游推导出来的那点信息**——哪些上游值得列，以及用中文怎么说清楚它做什么。其余全部在同步时取回来。

版本号从 npm registry 和 GitHub releases 现取。手写的版本号只在写下的那一刻是真的。

两种上游，因为确实是两种东西：

- **`git-skills`** — 本身就是一个可加载的包（比如 Waza）。只列出来，安装时直接克隆上游，Lyra 按它当前的样子读它的 `skills/`。用户拿到的永远是那个项目此刻的状态，不是我们某天的快照。
- **`npm-mcp`** / **`npm-cli`** — 发布在 npm 上，没有仓库可克隆。这时包装无法避免：一个 MCP 服务本质是一行命令，总得有人写下那行命令是什么。包装只有一个 manifest 和一个 `.mcp.json`，都由脚本生成，都钉在 `@latest`——不让包装自己变成过期的那一部分。

## 改这里

只改 `sources.json`。`registry.json` 和 `plugins/` 都是生成物：

```bash
node scripts/sync.mjs           # 重新生成
node scripts/sync.mjs --check   # 只检查是否同步，CI 用
```

## 提一个插件

开 PR，往 `sources.json` 的 `sources` 里加一条。会看这几件事：

- 上游是公开的、能跑的，而且最近还有人管
- `description` 说的是它**做什么**，不是它多好用
- 它解决的问题和已有的九个不重复
- `id` 没被占用

## 索引的字段

`registry.json` 是 `{ "name": "...", "plugins": [...] }`，也接受一个裸数组。每条只有 `name` 和 `repository` 是必需的；`path` 用于一个仓库里放多个插件，`category` 决定它在目录页里归到哪一组。

## 浏览是安全的，安装才不是

索引里没有任何代码，每一条都只是「某个东西在哪」。Lyra 在你点安装之前不执行任何东西，点了之后做的也只是 `git clone --depth 1`。

之后它就是你机器上的代码了。技能是 markdown，MCP 服务是一份声明——但那份声明里写的命令，启用之后会在你的机器上以你的权限运行。**装之前请自己看一眼它的仓库**：这份索引不做审核，列在这里只表示我们认为它有用，不表示我们审计过它。
