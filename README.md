# Lyra Plugins

[Lyra](https://github.com/kittors/Lyra) 的插件市场。

一个市场就是一个 https 地址，指向一份 JSON。没有服务要跑，没有协议要实现——这份索引可以是一个仓库里的文件，而已经存在的技能集合大多就是这个形状。

## 在 Lyra 里添加

侧边栏 →「插件」→ 右上角「添加」→「添加插件市场」，填：

```
https://raw.githubusercontent.com/kittors/Lyra-Plugins/main/registry.json
```

## 索引的格式

`registry.json` 是 `{ "name": "...", "plugins": [...] }`，也接受一个裸数组。

每一条只有两个字段是必需的：

| 字段 | 必需 | 说明 |
| --- | --- | --- |
| `name` | ✅ | 显示的名字。也接受 `title` / `displayName` |
| `repository` | ✅ | 克隆地址，`https://` 或 `git@` 开头。也接受 `repo` / `url` / `git` |
| `id` | | 装成的目录名，同时是它在这份索引里的身份。省略时从 `name` 推导 |
| `description` | | 卡片上那一行。也接受 `summary` / `shortDescription` |
| `category` | | 目录页按它分区。没有的落到最后一组 |
| `logo` | | 图标，必须是 `http(s)` 绝对地址。没有时按名字生成一个带首字母的色块 |
| `brandColor` | | 上面那个色块的颜色 |
| `author`、`homepage`、`path` | | `path` 用于一个仓库里装了多个插件的情况 |

一条完整的：

```json
{
  "id": "chrome-control",
  "name": "Chrome",
  "description": "从对话里驱动浏览器：开标签页、点按钮、读页面。",
  "repository": "https://github.com/someone/lyra-chrome.git",
  "category": "Productivity",
  "homepage": "https://example.com",
  "brandColor": "#4285f4"
}
```

## 提交一个插件

开一个 PR，往 `plugins` 数组里加一条。请确认：

- `repository` 是公开可克隆的，且根目录（或 `path` 指向的目录）下有 `plugin.json`
- `description` 说的是它**做什么**，不是它有多好
- `id` 在这份索引里没被占用

## 浏览是安全的，安装才不是

这份索引里没有任何代码，每一条都只是「某个东西在哪」的描述。Lyra 在你点安装之前不会执行任何东西，点了之后做的也只是 `git clone --depth 1`。

但那之后它就是你机器上的代码了。一个插件带来的技能是 markdown，MCP 服务是一份声明——后者默认不启用，要你自己去设置里打开。**装之前请自己看一眼仓库**：这份索引不做审核，列在这里不代表任何背书。
