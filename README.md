# Lyra Plugins

[Lyra](https://github.com/kittors/Lyra) 的插件市场。每小时从上游同步一次版本。

## 加到 Lyra 里

侧边栏 →「插件」→ 右上角「添加」→「添加插件市场」，填：

```
https://raw.githubusercontent.com/kittors/Lyra-Plugins/main/registry.json
```

## 现在有什么

70 条。🔑 表示装好后要填一个密钥（在 Lyra 的插件详情页或 设置 › 插件 › MCP 里填，加密存在本机）。

| 分类 | 名称 | 种类 | 上游 | 做什么 |
| --- | --- | --- | --- | --- |
| 开发 | Cloudflare Skills | 插件 | [cloudflare/skills](https://github.com/cloudflare/skills) | Cloudflare 官方的 14 个技能：在 Workers 上写代码、部署、调性能。 |
| 开发 | Context7 | MCP | [upstash/context7](https://github.com/upstash/context7) | 取库的当前文档，而不是模型记忆里那个版本的。 |
| 开发 | Expo | 插件 | [expo/skills](https://github.com/expo/skills) | Expo 官方的 24 个技能：路由、原生界面、EAS 构建上架、SDK 升级。 |
| 开发 | Git | MCP | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | 在本机仓库里看状态、读 diff、翻日志、提交、建和切分支。不碰远端。 |
| 开发 | GitHub | MCP（远程） | [github/github-mcp-server](https://github.com/github/github-mcp-server) | 🔑 GitHub 官方：读仓库和代码、查和改 issue、看和评审 PR。 |
| 开发 | Matt Pocock Skills | 技能集 | [mattpocock/skills](https://github.com/mattpocock/skills) | Matt Pocock 自用的 18 个工程技能：TDD、排查难缠的 bug、评审、拆工单。 |
| 开发 | Ponytail | 技能集 | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | 逼 agent 少写代码：浏览器自带的就不装库，一行能解决就不写十行。 |
| 开发 | Python Development | 插件 | [wshobson/agents](https://github.com/wshobson/agents) | 16 条 Python 工程写法：异步、错误处理、打包、测试、类型、性能、可观测性。 |
| 开发 | Repomix | MCP | [yamadashy/repomix](https://github.com/yamadashy/repomix) | 把整个代码仓库打包成一个模型好读的文件，本机目录和 GitHub 仓库都行。 |
| 开发 | shadcn/ui | MCP |  | 在 shadcn/ui 和第三方组件注册表里找组件、看源码和示例，给出安装命令。 |
| 开发 | Stripe | MCP（远程） | `https://mcp.stripe.com` | 🔑 让 agent 查和改 Stripe 里的客户、价格、订阅、发票、退款，并能搜 Stripe 文档。 |
| 开发 | Vercel Agent Skills | 技能集 | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Vercel 官方的 9 个技能：React/Next.js 性能规则、部署、界面与文案审查。 |
| 工作流 | Agent Skills（Addy Osmani） | 插件 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | 按「定义、计划、构建、验证、评审、上线」六个阶段写成的 25 个工程技能。 |
| 工作流 | Compound Engineering | 技能集 | [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) | 36 个工程技能：出方案、评审、调试、提交、盯 PR，并把每次学到的写回仓库。 |
| 工作流 | Superpowers | 插件 | [obra/superpowers](https://github.com/obra/superpowers) | 一套写代码的做事顺序：先问清需求、写计划、测试先行、派子 agent、交付前自证。 |
| 工作流 | Waza | 技能集 | [tw93/Waza](https://github.com/tw93/Waza) | 八件工程上的老规矩，写成了 agent 能照着执行的流程：出方案、审代码、查故障、做界面、读材料、写稿子、做研究、体检配置。 |
| 浏览器 | Agent Browser | 插件 | [sleepinginsummer/agent-browser-cli](https://github.com/sleepinginsummer/agent-browser-cli) | 控制你自己那个 Chrome：开标签页、点按钮、读页面、跑 JS。登录态和 Cookie 都还在。 |
| 浏览器 | Chrome DevTools | MCP | [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | 性能追踪、网络请求、控制台——把 DevTools 里那几个面板交给 agent 读。 |
| 浏览器 | Playwright | MCP | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | 用无障碍树而不是截图来驱动浏览器，所以它读到的是结构，不是像素。 |
| 搜索 | Brave Search | MCP | [brave/brave-search-mcp-server](https://github.com/brave/brave-search-mcp-server) | 🔑 Brave 自建索引的搜索：网页、新闻、图片、视频、本地商户，外加结果摘要。 |
| 搜索 | DuckDuckGo | MCP | [nickclyde/duckduckgo-mcp-server](https://github.com/nickclyde/duckduckgo-mcp-server) | 用 DuckDuckGo 搜网页、读网页。不用注册，不用密钥。 |
| 搜索 | Exa | MCP（远程） | [exa-labs/exa-mcp-server](https://github.com/exa-labs/exa-mcp-server) | 按意思而不是关键词找网页，结果直接带着清理好的正文。 |
| 搜索 | Fetch | MCP | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | 把一个网址取回来，转成 Markdown 给模型读。不开浏览器，不跑 JS。 |
| 搜索 | Firecrawl | MCP（远程） | [firecrawl/firecrawl-mcp-server](https://github.com/firecrawl/firecrawl-mcp-server) | 把网页和文档变成干净的 Markdown：单页抓取、搜索、整站爬取、结构化抽取。 |
| 搜索 | Tavily | MCP | [tavily-ai/tavily-mcp](https://github.com/tavily-ai/tavily-mcp) | 🔑 给 agent 用的搜索 API，另带网页抽取、整站爬取、站点地图和多步调研。 |
| 文档 | AWS Documentation | MCP | [awslabs/mcp](https://github.com/awslabs/mcp) | 搜索和阅读 AWS 官方文档，在大表格里只取需要的行，推荐相关页面。 |
| 文档 | Cloudflare Docs | MCP（远程） | [cloudflare/mcp-server-cloudflare](https://github.com/cloudflare/mcp-server-cloudflare) | 搜索 Cloudflare 官方文档：Workers、Pages、R2、D1、KV 等。 |
| 文档 | DeepWiki | MCP（远程） | `https://mcp.deepwiki.com/mcp` | 问任何一个公开 GitHub 仓库：它的架构怎么分、某个功能是怎么实现的。 |
| 文档 | GitMCP | MCP（远程） | [idosal/git-mcp](https://github.com/idosal/git-mcp) | 让模型现查任意公开 GitHub 仓库的文档和代码，不依赖事先建好的索引。 |
| 文档 | Microsoft Learn | MCP（远程） | [MicrosoftDocs/mcp](https://github.com/MicrosoftDocs/mcp) | 搜索和阅读微软官方文档与代码示例：Azure、.NET、Windows、Microsoft 365。 |
| 文档 | Obsidian Skills | 技能集 | [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) | 让 agent 会写 Obsidian 的双链笔记、Bases 视图和 Canvas 白板。 |
| 数据 | Data（Anthropic） | 插件 | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | Anthropic 的数据分析插件：写 SQL、探查数据、统计、出图、做仪表盘。 |
| 数据 | DBHub | MCP | [bytebase/dbhub](https://github.com/bytebase/dbhub) | 🔑 一个服务连 PostgreSQL、MySQL、MariaDB、SQL Server、Oracle 和 SQLite。 |
| 数据 | MongoDB | MCP | [mongodb-js/mongodb-mcp-server](https://github.com/mongodb-js/mongodb-mcp-server) | 🔑 查 MongoDB：列库和集合、看 schema 和索引、find、聚合、explain。默认只读。 |
| 数据 | Redis | MCP | [redis/mcp-redis](https://github.com/redis/mcp-redis) | 🔑 用自然语言读写 Redis：字符串、哈希、列表、集合、Stream、JSON 和向量检索。 |
| 数据 | Supabase | MCP（远程） | [supabase/mcp](https://github.com/supabase/mcp) | 🔑 查 Supabase 项目：表和迁移、跑只读 SQL、看日志和安全建议、生成类型。 |
| 数据 | Supabase Skills | 技能集 | [supabase/agent-skills](https://github.com/supabase/agent-skills) | Supabase 官方：Supabase 各产品的用法，外加通用的 Postgres 最佳实践。 |
| 设计 | draw.io | MCP | [jgraph/drawio-mcp](https://github.com/jgraph/drawio-mcp) | 让 agent 画流程图、架构图、时序图，在 draw.io 编辑器里打开接着改。 |
| 设计 | Emil Kowalski Skills | 技能集 | [emilkowalski/skills](https://github.com/emilkowalski/skills) | Emil Kowalski 的界面技能：动画该不该做、用什么曲线、多长，交互怎么调。 |
| 设计 | Figma | MCP | [GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) | 🔑 把 Figma 设计稿的布局、样式和图片交给 agent，照着稿子写界面。 |
| 设计 | Taste Skill | 技能集 | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | 治 AI 做前端的通病：千篇一律的渐变、卡片和字体，先定设计方向再出页面。 |
| 设计 | UI UX Pro Max | 技能集 | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 带检索数据的界面设计技能：按产品类型推荐风格、配色、字体搭配和页面结构。 |
| 办公 | Anthropic Skills | 技能集 | [anthropics/skills](https://github.com/anthropics/skills) | Anthropic 官方的一组示例技能：文档处理之外的设计、写作、做演示、调 MCP 等。 |
| 办公 | Excel | MCP | [haris-musa/excel-mcp-server](https://github.com/haris-musa/excel-mcp-server) | 不用装 Excel，直接读写 .xlsx：数据、公式、格式、图表、数据透视表。 |
| 办公 | Marketing Skills | 插件 | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 50 个营销技能：落地页转化、文案、SEO、广告投放、邮件、定价、发布。 |
| 办公 | MarkItDown | MCP | [microsoft/markitdown](https://github.com/microsoft/markitdown) | 把 PDF、Word、Excel、PPT、EPUB、网页等转成 Markdown 给模型读。 |
| 办公 | Notion | MCP | [makenotion/notion-mcp-server](https://github.com/makenotion/notion-mcp-server) | 🔑 通过 Notion API 搜索、读写页面和数据库，页面能直接按 Markdown 读写。 |
| 办公 | Obsidian | MCP | [MarkusPfundstein/mcp-obsidian](https://github.com/MarkusPfundstein/mcp-obsidian) | 🔑 读写你的 Obsidian 仓库：搜索笔记、按标签找、在指定标题下插入内容。 |
| 协作 | Atlassian | MCP | [sooperset/mcp-atlassian](https://github.com/sooperset/mcp-atlassian) | 查和改 Jira 与 Confluence：JQL 搜索、建单改单、流转状态、读写页面。 |
| 协作 | Slack | MCP | [korotovsky/slack-mcp-server](https://github.com/korotovsky/slack-mcp-server) | 🔑 读 Slack 的频道、私信和讨论串，搜消息，看未读。发消息默认关闭。 |
| 思考 | Context Engineering | 技能集 | [muratcankoylan/Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) | 17 个讲上下文工程的技能：压缩、退化诊断、记忆、多 agent 分工、工具设计、评测。 |
| 思考 | I Have ADHD | 技能集 | [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) | 先说下一步，步骤编号，不绕弯：治 agent 把答案埋在三段铺垫下面的毛病。 |
| 思考 | Memory | MCP | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | 把跨会话要记住的东西存成一张知识图谱，而不是每次重讲一遍。 |
| 思考 | Planning with Files | 技能集 | [OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files) | 把计划、发现和进度写进三个文件，上下文被压缩或会话中断后还能接着做。 |
| 思考 | Sequential Thinking | MCP | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | 把一个难问题拆成能一步步走、并且允许走回头路的思考。 |
| 思考 | 卡兹克的技能 | 技能集 | [KKKKhazix/khazix-skills](https://github.com/KKKKhazix/khazix-skills) | 卡兹克自用的 6 个技能：写任务书、横纵分析、公众号长文、收尾整理、查 AI 资讯。 |
| 科研 | arXiv | MCP | [blazickjp/arxiv-mcp-server](https://github.com/blazickjp/arxiv-mcp-server) | 搜 arXiv、下载论文存在本地、按章节读正文和 LaTeX 源码、导出 BibTeX。 |
| 科研 | Bio Research（Anthropic） | 插件 | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | Anthropic 的生命科学插件：单细胞数据质控与整合、nf-core 流程、科研选题。 |
| 科研 | Hugging Face | MCP（远程） | [huggingface/hf-mcp-server](https://github.com/huggingface/hf-mcp-server) | 在 Hugging Face Hub 上查模型、数据集、Space 和论文。 |
| 科研 | Hugging Face Skills | 技能集 | [huggingface/skills](https://github.com/huggingface/skills) | Hugging Face 官方：在 Hub 上找模型和数据集，训练、评测、发布模型。 |
| 科研 | Zotero | MCP | [54yyyu/zotero-mcp](https://github.com/54yyyu/zotero-mcp) | 让 agent 读你的 Zotero 文献库：检索条目、读全文和批注、整理笔记、导出参考文献。 |
| 云与运维 | Google Cloud Skills | 技能集 | [google/skills](https://github.com/google/skills) | Google 官方的 129 个 Google Cloud 技能：部署、运维、数据与 AI 服务。 |
| 云与运维 | Grafana | MCP | [grafana/mcp-grafana](https://github.com/grafana/mcp-grafana) | 🔑 查 Grafana 的仪表盘、Prometheus 指标、Loki 日志、告警和值班，出了事先问它。 |
| 云与运维 | Kubernetes | MCP | [Flux159/mcp-server-kubernetes](https://github.com/Flux159/mcp-server-kubernetes) | 用你本机的 kubectl 和 kubeconfig 管集群：查资源、看日志、apply、扩缩容、装 Helm。 |
| 云与运维 | Sentry | MCP（远程） | [getsentry/sentry-mcp](https://github.com/getsentry/sentry-mcp) | 🔑 查 Sentry 里的报错和事件，读完整堆栈，让 Seer 分析根因，顺手改 issue 状态。 |
| 安全 | Static Analysis（Trail of Bits） | 插件 | [trailofbits/skills](https://github.com/trailofbits/skills) | Trail of Bits 出的：用 Semgrep、CodeQL 扫代码漏洞，再整理扫描结果。 |
| 媒体 | 宝玉的技能 | 技能集 | [JimLiu/baoyu-skills](https://github.com/JimLiu/baoyu-skills) | 宝玉的 21 个内容技能：配图、封面、信息图、翻译，发到公众号、微博和 X。 |
| 本机 | Desktop Commander | MCP | [wonderwhy-er/DesktopCommanderMCP](https://github.com/wonderwhy-er/DesktopCommanderMCP) | 在本机跑命令、编辑文件、管进程。长任务在后台跑，不占着对话。 |
| 本机 | Filesystem | MCP | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | 只在你点名的目录里读写。官方实现，边界是硬的。 |
| 本机 | Time | MCP | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | 告诉模型现在几点，并在时区之间换算时间。 |

## 这个仓库是镜子，不是仓库

每一条都是别人的东西，而且别人还在改。所以这里存的是**没法从上游推导出来的那点信息**——哪些上游值得列，以及用中文怎么说清楚它做什么。其余全部在同步时取回来。

版本号从 npm registry 和 GitHub releases 现取。手写的版本号只在写下的那一刻是真的。

几种上游，因为确实是几种东西：

- **`git-skills`** — 本身就是一个可加载的包（比如 Waza）。只列出来，安装时直接克隆上游，Lyra 按它当前的样子读它的 `skills/`。用户拿到的永远是那个项目此刻的状态，不是我们某天的快照。
- **`npm-mcp`** / **`npm-cli`** — 发布在 npm 上，没有仓库可克隆。这时包装无法避免：一个 MCP 服务本质是一行命令，总得有人写下那行命令是什么。包装只有一个 manifest 和一个 `.mcp.json`，都由脚本生成，都钉在 `@latest`——不让包装自己变成过期的那一部分。
- **`pypi-mcp`** — 发布在 PyPI 上、用 `uvx` 启动的 MCP 服务。包装同上，参数写成 `pkg@latest`（uvx 第一次之后默认用缓存，不写 @latest 就一直是那一版）。版本号从 PyPI 取。
- **`remote-mcp`** — 别人托管的远程 MCP（Streamable HTTP / SSE），包装里只有一个 URL，没有包可装，也就没有版本号。
- **`skill-collection`** — 一个仓库里的一层技能目录（`path` 指到它），Lyra 整个装成一个包，技能之间的相对引用原样保留。

每一条都有自己的图标：包装的放在 `plugins/<id>/.lyra-plugin/icon.svg`，随包一起发布；直接列出的上游仓库没法往里放文件，图标放在 `icons/<id>.svg`，由维护者上传到市场平台。画法统一：品牌色圆角方块加一个线条图形（图形取自 [Lucide](https://lucide.dev)，ISC 许可）。不用作者的 GitHub 头像——那是人的脸，不是产品的标志，而且同一个作者的几条会长得一模一样。

要密钥的服务在条目里写 `env`：每个值一行，名字、一句说明、去哪里申请（`url`）、能不能不填（`optional`）。包装里在该放值的地方写 `${NAME}`（本地服务是一个同名环境变量，远程服务是请求头），manifest 里带上这些说明；Lyra 装好后在界面上请人填，填的值加密存在本机，不写进任何文件。可选的值没填就不传。

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
- 它解决的问题和已有的条目不重复
- `id` 没被占用

## 索引的字段

`registry.json` 是 `{ "name": "...", "plugins": [...] }`，也接受一个裸数组。每条只有 `name` 和 `repository` 是必需的；`path` 用于一个仓库里放多个插件，`category` 决定它在目录页里归到哪一组。

## 浏览是安全的，安装才不是

索引里没有任何代码，每一条都只是「某个东西在哪」。Lyra 在你点安装之前不执行任何东西，点了之后做的也只是 `git clone --depth 1`。

之后它就是你机器上的代码了。技能是 markdown，MCP 服务是一份声明——但那份声明里写的命令，启用之后会在你的机器上以你的权限运行。**装之前请自己看一眼它的仓库**：这份索引不做审核，列在这里只表示我们认为它有用，不表示我们审计过它。
