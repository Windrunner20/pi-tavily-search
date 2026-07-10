<div align="center">

# 🌐 Pi Tavily Search

**Context-safe Tavily web search for the Pi coding agent**

[English](README.md) · [简体中文](README.zh-CN.md)

[![npm](https://img.shields.io/npm/v/%40windrunner20%2Fpi-tavily-search?color=cb3837)](https://www.npmjs.com/package/@windrunner20/pi-tavily-search)
[![CI](https://github.com/Windrunner20/pi-tavily-search/actions/workflows/ci.yml/badge.svg)](https://github.com/Windrunner20/pi-tavily-search/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/Windrunner20/pi-tavily-search)](https://github.com/Windrunner20/pi-tavily-search/releases)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522-339933)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

Tavily can return enough page content to overwhelm an agent's context window. This Pi extension keeps search results useful and bounded: concise evidence stays in context, while full responses are stored in private temporary files for incremental reading.

## ✨ Highlights

| Capability | Behavior |
| --- | --- |
| Context budget | Up to **8KB per call**, **16KB per turn** |
| Search modes | `basic`, `advanced`, `fast`, `ultra-fast` |
| Results | 5 by default, 10 maximum |
| Raw content | Saved outside chat as private `0600` JSON |
| Security | Search content is explicitly marked as untrusted |
| Cleanup | Session cleanup plus 24-hour stale-file cleanup |

## 🚀 Quick start

```bash
pi install npm:@windrunner20/pi-tavily-search
```

Configure a Tavily API key:

```bash
export TAVILY_API_KEY=tvly-YOUR-KEY
```

Restart Pi or run:

```text
/reload
```

Then ask Pi to search the web normally. The model can call `tavily_search` when current external information is needed.

> Requirements: Pi `0.80.6+`, Node.js `22+`, and a [Tavily API key](https://tavily.com/).

## ⚙️ Configuration

The API key is resolved in this order:

1. `TAVILY_API_KEY`
2. `$PI_CODING_AGENT_DIR/tavily-api-key`
3. `~/.tavily-api-key`

To use a private key file:

```bash
mkdir -p ~/.pi/agent
printf '%s\n' 'tvly-YOUR-KEY' > ~/.pi/agent/tavily-api-key
chmod 600 ~/.pi/agent/tavily-api-key
```

| Setting | Default | Description |
| --- | --- | --- |
| `TAVILY_SEARCH_DEPTH` | `basic` | Default search depth |
| `TAVILY_REQUEST_TIMEOUT_MS` | `30000` | Request timeout, clamped to 100–120000ms |

## 🧰 Commands

| Command | Purpose |
| --- | --- |
| `/tavily-status` | Show API-key status and default depth |
| `/tavily-depth [depth]` | Show or change the default depth |
| `/tavily-clean` | Delete raw artifacts created by this session |

## 🔎 Tool options

```text
tavily_search({
  query: string,                    // 1–400 characters
  search_depth?: "basic" | "advanced" | "fast" | "ultra-fast",
  max_results?: integer,           // 1–10, default 5
  include_answer?: boolean,        // default true
  include_raw_content?: boolean,   // default false
  include_images?: boolean         // default false
})
```

When raw content is requested or a digest is truncated, the full response is written to:

```text
/tmp/pi-tavily-XXXXXX/result.json
```

The model receives the path and can inspect the file incrementally with Pi's `read` tool.

<details>
<summary><strong>npm, pnpm, Yarn, and Pi installation</strong></summary>

The package is published once to the public npm Registry. npm, pnpm, and Yarn can all download it:

```bash
npm install @windrunner20/pi-tavily-search
pnpm add @windrunner20/pi-tavily-search
yarn add @windrunner20/pi-tavily-search
```

For Pi, prefer:

```bash
pi install npm:@windrunner20/pi-tavily-search
```

`pi install` downloads the package **and** registers its `pi.extensions` manifest. A plain `pnpm add` or `npm install` only adds a Node dependency and does not register the extension with Pi.

Pinned alternatives:

```bash
pi install npm:@windrunner20/pi-tavily-search@1.0.0
pi install git:github.com/Windrunner20/pi-tavily-search@v1.0.0
```

</details>

## 🛡️ Security

Web pages may contain prompt-injection instructions. This extension provides defense in depth by:

- marking all search output as untrusted external data;
- keeping raw page content out of chat and tool details;
- bounding error bodies and upstream responses;
- applying a 30-second default request deadline;
- creating raw artifacts with `0600` permissions.

See [SECURITY.md](SECURITY.md) for the full threat model.

## 🧪 Development

```bash
npm ci
npm run check
```

Optional live integration test:

```bash
TAVILY_API_KEY=tvly-... npm run test:integration
```

## 📚 Links

- [npm package](https://www.npmjs.com/package/@windrunner20/pi-tavily-search)
- [Releases](https://github.com/Windrunner20/pi-tavily-search/releases)
- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## License

[MIT](LICENSE)
