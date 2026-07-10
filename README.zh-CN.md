# Pi Tavily Search

[English](README.md) | [简体中文](README.zh-CN.md)

[![CI](https://github.com/Windrunner20/pi-tavily-search/actions/workflows/ci.yml/badge.svg)](https://github.com/Windrunner20/pi-tavily-search/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/%40windrunner20%2Fpi-tavily-search)](https://www.npmjs.com/package/@windrunner20/pi-tavily-search)
[![Release](https://img.shields.io/github/v/release/Windrunner20/pi-tavily-search)](https://github.com/Windrunner20/pi-tavily-search/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一个面向生产环境的 [Pi](https://pi.dev) Tavily 网页搜索扩展，提供严格的上下文预算、来源 URL、提示词注入防护，以及不会直接进入对话上下文的完整搜索结果文件。

## 为什么需要这个插件

不受限制的网页搜索结果很容易占满 Agent 的上下文窗口。在原始插件的真实历史数据中，单次 Tavily Tool Result 最大达到过 **13MB**。主要原因是网页全文同时进入了模型可见输出和持久化的 Tool Details。

本插件只把模型真正需要的摘要和来源保留在上下文中，将完整响应写入私有临时文件，并允许 Pi 按需分段读取。

## 功能特性

- 提供 `tavily_search` 工具。
- 支持 `basic`、`advanced`、`fast`、`ultra-fast` 四种搜索深度。
- 单次调用最多约 8KB 模型可见输出。
- 同一个 Pi Turn 内的并行搜索共享 16KB 总预算。
- 默认返回 5 条结果，最大 10 条。
- 网页 raw content 不会进入聊天输出或 Tool Details。
- 请求 raw content 或摘要被截断时，将完整响应保存为权限 `0600` 的临时 JSON 文件。
- Session 结束时清理当前会话的临时文件。
- Session 启动时清理超过 24 小时的旧临时文件。
- 搜索内容明确标记为不可信外部数据。
- 使用兼容 Google Provider 的字符串枚举 Schema。
- 提供状态、默认深度和临时文件清理命令。

## 环境要求

- Pi coding agent `0.80.6` 或更高版本。
- Node.js 22 或更高版本。
- 一个 [Tavily API Key](https://tavily.com/)。

## 安装

推荐通过 npm Registry 安装最新版：

```bash
pi install npm:@windrunner20/pi-tavily-search
```

锁定 v1.0.0：

```bash
pi install npm:@windrunner20/pi-tavily-search@1.0.0
```

也可以从 GitHub Tag 安装：

```bash
pi install git:github.com/Windrunner20/pi-tavily-search@v1.0.0
```

安装后重启 Pi，或者在正在运行的 Pi 中执行：

```text
/reload
```

临时试用而不写入安装配置：

```bash
pi -e npm:@windrunner20/pi-tavily-search@1.0.0
```

本地开发安装：

```bash
pi install /absolute/path/to/pi-tavily-search
```

### npm、pnpm 和 Yarn 的关系

本包只需要发布一次，发布位置是公共 npm Registry：

```text
https://registry.npmjs.org
```

npm、pnpm 和 Yarn 默认都从这个 Registry 获取包，因此不存在一个需要单独发布的“pnpm Registry 版本”。以下命令都可以下载本包：

```bash
npm install @windrunner20/pi-tavily-search
pnpm add @windrunner20/pi-tavily-search
yarn add @windrunner20/pi-tavily-search
```

但是 **Pi 用户应该优先使用**：

```bash
pi install npm:@windrunner20/pi-tavily-search
```

原因是 `pi install` 不只是下载 Node 包，还会读取 `package.json` 中的 `pi.extensions` Manifest，将扩展登记到 Pi 设置，并允许后续通过 `pi list`、`pi remove`、`pi update` 进行管理。

在任意项目中执行 `pnpm add` 或 `npm install` 只会添加一个 Node 依赖，并不会自动把它注册为 Pi Extension。

可以用 pnpm 验证包是否可见：

```bash
pnpm view @windrunner20/pi-tavily-search
```

## 配置

### API Key

插件按照以下优先顺序寻找 Tavily API Key：

1. `TAVILY_API_KEY`
2. `$PI_CODING_AGENT_DIR/tavily-api-key`
3. `~/.tavily-api-key`

Pi 的默认 Agent 目录通常为 `~/.pi/agent`。可以创建私有 Key 文件：

```bash
install -m 600 /dev/null ~/.pi/agent/tavily-api-key
printf '%s\n' 'tvly-YOUR-KEY' > ~/.pi/agent/tavily-api-key
chmod 600 ~/.pi/agent/tavily-api-key
```

API Key 只会作为 `Authorization: Bearer` Header 发送到：

```text
https://api.tavily.com/search
```

请求超时可以通过以下环境变量设置：

```bash
export TAVILY_REQUEST_TIMEOUT_MS=30000
```

允许范围为 100–120000 毫秒，默认值为 30000 毫秒。

### 默认搜索深度

为当前进程设置：

```bash
export TAVILY_SEARCH_DEPTH=basic
```

也可以在 Pi 中执行：

```text
/tavily-depth advanced
```

该命令会写入：

```text
$PI_CODING_AGENT_DIR/tavily-search.json
```

优先顺序：

1. `TAVILY_SEARCH_DEPTH`
2. `tavily-search.json`
3. `basic`

## 工具接口

```text
tavily_search({
  query: string,                    // 1–400 个字符
  search_depth?: "basic" | "advanced" | "fast" | "ultra-fast",
  max_results?: integer,            // 1–10，默认 5
  include_answer?: boolean,         // 默认 true
  include_raw_content?: boolean,    // 默认 false
  include_images?: boolean          // 默认 false
})
```

示例：

```json
{
  "query": "Pi coding agent extension documentation",
  "search_depth": "advanced",
  "max_results": 5,
  "include_answer": true,
  "include_raw_content": false
}
```

## Pi 命令

### `/tavily-status`

检查是否已经配置 API Key，并显示当前默认搜索深度。

### `/tavily-depth [depth]`

显示或修改默认搜索深度：

```text
/tavily-depth
/tavily-depth basic
/tavily-depth advanced
/tavily-depth fast
/tavily-depth ultra-fast
```

### `/tavily-clean`

删除当前 Session 创建的 Tavily 完整响应临时文件。

## 上下文和完整响应文件

### 紧凑输出

模型会看到：

- 不可信外部内容警告；
- 经过限长的 Tavily Answer；
- 标题、URL、相关度和限长后的 Snippet；
- 单次调用最多约 8KB；
- 同一个 Turn 内所有搜索合计最多约 16KB。

如果并行搜索已经预留了整个 Turn 的预算，后续搜索会被安全跳过，而不是继续挤占上下文。

### Raw Content

当 `include_raw_content` 为 `true` 时，插件会向 Tavily 发送：

```json
{
  "include_raw_content": "markdown"
}
```

但是网页全文不会直接返回给模型。完整响应会写入类似路径：

```text
/tmp/pi-tavily-XXXXXX/result.json
```

JSON 文件开头包含不可信内容警告。Pi 可以使用 `read` 工具的 `offset` 和 `limit` 分段读取。

临时文件：

- 使用 `0600` 权限创建；
- Session 正常退出时自动删除；
- 可以通过 `/tavily-clean` 手动删除；
- 超过 24 小时后会在下一次 Session 启动时被清理。

## 安全说明

网页可能包含 Prompt Injection，例如要求 Agent 忽略系统指令、读取密钥或执行命令。本插件同时添加：

- 系统级安全指引；
- 每次 Tool Result 顶部的不可信数据警告；
- Raw Content 与模型上下文隔离；
- API 错误正文限长和不可信标记；
- 30 秒默认请求超时；
- 32MB 上游响应硬限制。

这些措施属于纵深防御，并不能保证完全消除所有提示词注入风险。在拥有密钥或高权限工具的环境中部署前，请阅读 [SECURITY.md](SECURITY.md)。

## 开发

```bash
npm ci
npm run typecheck
npm test
npm run pack:check
```

运行真实 Tavily 集成测试：

```bash
TAVILY_API_KEY=tvly-... npm run test:integration
```

运行完整离线发布门禁：

```bash
npm run check
```

## 兼容性与版本规范

v1 稳定接口包括：

- 工具名称 `tavily_search`；
- 命令 `tavily-status`、`tavily-depth`、`tavily-clean`；
- 文档中列出的环境变量和配置文件；
- 有界输出和私有完整响应文件行为。

对以上合同的破坏性修改需要发布新的主版本。

## 相关链接

- npm：https://www.npmjs.com/package/@windrunner20/pi-tavily-search
- GitHub Release：https://github.com/Windrunner20/pi-tavily-search/releases/tag/v1.0.0
- 安全策略：[SECURITY.md](SECURITY.md)
- 更新记录：[CHANGELOG.md](CHANGELOG.md)

## 许可证

[MIT](LICENSE)
