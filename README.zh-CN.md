<div align="center">

# 🌐 Pi Tavily Search

**为 Pi coding agent 提供上下文安全的 Tavily 网页搜索**

[English](README.md) · [简体中文](README.zh-CN.md)

[![npm](https://img.shields.io/npm/v/%40windrunner20%2Fpi-tavily-search?color=cb3837)](https://www.npmjs.com/package/@windrunner20/pi-tavily-search)
[![CI](https://github.com/Windrunner20/pi-tavily-search/actions/workflows/ci.yml/badge.svg)](https://github.com/Windrunner20/pi-tavily-search/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/Windrunner20/pi-tavily-search)](https://github.com/Windrunner20/pi-tavily-search/releases)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522-339933)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

Tavily 可能返回大量网页内容，很容易占满 Agent 的上下文窗口。本插件只把精简、可引用的搜索证据放入上下文，将完整响应保存为私有临时文件，供 Pi 按需分段读取。

## ✨ 核心特性

| 能力 | 行为 |
| --- | --- |
| 上下文预算 | 单次最多 **8KB**，单 Turn 合计最多 **16KB** |
| 搜索模式 | `basic`、`advanced`、`fast`、`ultra-fast` |
| 结果数量 | 默认 5 条，最大 10 条 |
| Raw Content | 保存为对话外的 `0600` 私有 JSON 文件 |
| 安全防护 | 搜索内容明确标记为不可信外部数据 |
| 自动清理 | Session 清理 + 24 小时陈旧文件清理 |

## 🚀 快速开始

```bash
pi install npm:@windrunner20/pi-tavily-search
```

配置 Tavily API Key：

```bash
export TAVILY_API_KEY=tvly-YOUR-KEY
```

重启 Pi，或者执行：

```text
/reload
```

之后正常让 Pi 查询最新网页信息即可，模型会在需要时调用 `tavily_search`。

> 环境要求：Pi `0.80.6+`、Node.js `22+`，以及一个 [Tavily API Key](https://tavily.com/)。

## ⚙️ 配置

插件按照以下顺序寻找 API Key：

1. `TAVILY_API_KEY`
2. `$PI_CODING_AGENT_DIR/tavily-api-key`
3. `~/.tavily-api-key`

使用私有 Key 文件：

```bash
mkdir -p ~/.pi/agent
printf '%s\n' 'tvly-YOUR-KEY' > ~/.pi/agent/tavily-api-key
chmod 600 ~/.pi/agent/tavily-api-key
```

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `TAVILY_SEARCH_DEPTH` | `basic` | 默认搜索深度 |
| `TAVILY_REQUEST_TIMEOUT_MS` | `30000` | 请求超时，限制在 100–120000ms |

## 🧰 Pi 命令

| 命令 | 用途 |
| --- | --- |
| `/tavily-status` | 查看 API Key 状态和默认深度 |
| `/tavily-depth [depth]` | 查看或修改默认深度 |
| `/tavily-clean` | 删除当前 Session 创建的完整响应文件 |

## 🔎 工具参数

```text
tavily_search({
  query: string,                    // 1–400 个字符
  search_depth?: "basic" | "advanced" | "fast" | "ultra-fast",
  max_results?: integer,           // 1–10，默认 5
  include_answer?: boolean,        // 默认 true
  include_raw_content?: boolean,   // 默认 false
  include_images?: boolean         // 默认 false
})
```

请求 Raw Content 或摘要被截断时，完整响应会写入：

```text
/tmp/pi-tavily-XXXXXX/result.json
```

模型只会收到文件路径，并可通过 Pi 的 `read` 工具分段读取。

<details>
<summary><strong>npm、pnpm、Yarn 与 Pi 安装的区别</strong></summary>

本包只需要发布一次到公共 npm Registry。npm、pnpm 和 Yarn 都可以下载：

```bash
npm install @windrunner20/pi-tavily-search
pnpm add @windrunner20/pi-tavily-search
yarn add @windrunner20/pi-tavily-search
```

Pi 用户应优先使用：

```bash
pi install npm:@windrunner20/pi-tavily-search
```

`pi install` 不仅下载包，还会注册其中的 `pi.extensions` Manifest。普通的 `pnpm add` 或 `npm install` 只会添加 Node 依赖，不会自动将其注册为 Pi Extension。

锁定版本或从 GitHub 安装：

```bash
pi install npm:@windrunner20/pi-tavily-search@1.0.0
pi install git:github.com/Windrunner20/pi-tavily-search@v1.0.0
```

</details>

## 🛡️ 安全说明

网页可能包含提示词注入内容。本插件通过以下方式提供纵深防御：

- 将所有搜索输出标记为不可信外部数据；
- Raw Content 不进入聊天输出和 Tool Details；
- 限制 API 错误正文和上游响应大小；
- 默认请求超时为 30 秒；
- 使用 `0600` 权限创建完整响应文件。

完整威胁模型请阅读 [SECURITY.md](SECURITY.md)。

## 🧪 开发

```bash
npm ci
npm run check
```

可选的真实 Tavily 集成测试：

```bash
TAVILY_API_KEY=tvly-... npm run test:integration
```

## 📚 相关链接

- [npm 包](https://www.npmjs.com/package/@windrunner20/pi-tavily-search)
- [版本发布](https://github.com/Windrunner20/pi-tavily-search/releases)
- [更新记录](CHANGELOG.md)
- [参与贡献](CONTRIBUTING.md)
- [安全策略](SECURITY.md)

## 许可证

[MIT](LICENSE)
