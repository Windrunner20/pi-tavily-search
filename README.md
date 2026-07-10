<div align="center">

# Pi Tavily Search

**Bounded Tavily web search for Pi users who need current information without flooding the model context.**

[English](README.md) · [简体中文](README.zh-CN.md)

[![npm](https://img.shields.io/npm/v/%40windrunner20%2Fpi-tavily-search?color=cb3837)](https://www.npmjs.com/package/@windrunner20/pi-tavily-search)
[![CI](https://github.com/Windrunner20/pi-tavily-search/actions/workflows/ci.yml/badge.svg)](https://github.com/Windrunner20/pi-tavily-search/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522-339933)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

Tavily can return enough page content to overwhelm an agent session. This Pi extension keeps concise, citation-ready evidence in context and moves complete responses to private temporary files for incremental reading.

- **Bounded:** up to 8KB per search and 16KB across searches in one Pi turn.
- **Useful:** titles, source URLs, relevance scores, and clipped snippets stay visible.
- **Defensive:** web content is marked as untrusted; raw pages never enter chat or tool details.

## Quick start

Requirements: Pi `0.80.6+`, Node.js `22+`, and a [Tavily API key](https://tavily.com/).

### 1. Install

```bash
pi install npm:@windrunner20/pi-tavily-search
```

### 2. Configure

```bash
export TAVILY_API_KEY=tvly-YOUR-KEY
```

Restart Pi or run:

```text
/reload
```

### 3. Verify

In Pi, run:

```text
/tavily-status
```

You should see that Tavily search is configured, together with the active default search depth.

### 4. Search

Ask Pi naturally, for example:

```text
Search the latest Pi extension documentation and cite the official sources.
```

A successful result contains source URLs, stays within the configured context budget, and begins with an untrusted-content warning.

## Common use

```text
Find the latest release notes for Node.js and cite primary sources.
```

```text
Compare PostgreSQL logical replication and Debezium. Use advanced search.
```

```text
Search the Tavily API docs. Fetch raw content only if the snippets are insufficient.
```

The model decides when to call `tavily_search`; users normally do not need to invoke the tool interface directly.

## Behavior at a glance

| Area | Behavior |
| --- | --- |
| Search depth | `basic`, `advanced`, `fast`, or `ultra-fast` |
| Results | 5 by default, 10 maximum |
| Context budget | 8KB per call, 16KB per turn |
| Raw content | Stored outside chat as a private `0600` JSON file |
| Request safety | 30-second default timeout and 32MB response limit |
| Cleanup | Session cleanup plus 24-hour stale-file cleanup |

When raw content is requested or a digest is truncated, the complete response is written to a path such as:

```text
/tmp/pi-tavily-XXXXXX/result.json
```

Pi receives the path and can inspect the file incrementally with its `read` tool.

## Configuration

The API key is resolved in this order:

1. `TAVILY_API_KEY`
2. `$PI_CODING_AGENT_DIR/tavily-api-key`
3. `~/.tavily-api-key`

To use Pi's default agent directory:

```bash
mkdir -p ~/.pi/agent
printf '%s\n' 'tvly-YOUR-KEY' > ~/.pi/agent/tavily-api-key
chmod 600 ~/.pi/agent/tavily-api-key
```

| Setting | Default | Purpose |
| --- | --- | --- |
| `TAVILY_SEARCH_DEPTH` | `basic` | Default search depth |
| `TAVILY_REQUEST_TIMEOUT_MS` | `30000` | Request timeout, clamped to 100–120000ms |

### Pi commands

| Command | Purpose |
| --- | --- |
| `/tavily-status` | Show API-key status and default depth |
| `/tavily-depth [depth]` | Show or change the default depth |
| `/tavily-clean` | Delete raw artifacts created by this session |

<details>
<summary><strong>Tool parameters</strong></summary>

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

</details>

<details>
<summary><strong>Alternative installation and package-manager notes</strong></summary>

Pin a version or install from GitHub:

```bash
pi install npm:@windrunner20/pi-tavily-search@1.0.0
pi install git:github.com/Windrunner20/pi-tavily-search@v1.0.0
```

Update or remove the package:

```bash
pi update npm:@windrunner20/pi-tavily-search
pi remove npm:@windrunner20/pi-tavily-search
```

npm, pnpm, and Yarn all resolve this package from the same public npm Registry; there is no separate pnpm release. For Pi, always prefer `pi install npm:...`: it downloads the package and registers its `pi.extensions` manifest. Installing it as a normal Node dependency does not register the extension with Pi.

</details>

## Security and permissions

Pi extensions execute with the user's operating-system permissions. This extension:

- sends search queries and options to `https://api.tavily.com/search`;
- reads the Tavily API key from the documented local sources;
- writes raw or truncated responses under the operating system's temporary directory;
- marks search output as untrusted external data;
- removes session artifacts on clean shutdown.

Web content can still contain prompt injection. Treat these controls as defense in depth, not a complete sandbox. Read the [security policy](SECURITY.md) before using the extension alongside secrets or powerful tools.

## Development

```bash
npm ci
npm run check
```

Optional live integration test:

```bash
TAVILY_API_KEY=tvly-... npm run test:integration
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidance.

## Project links

- [npm package](https://www.npmjs.com/package/@windrunner20/pi-tavily-search)
- [Releases](https://github.com/Windrunner20/pi-tavily-search/releases)
- [Changelog](CHANGELOG.md)
- [Security policy](SECURITY.md)
- [Issue tracker](https://github.com/Windrunner20/pi-tavily-search/issues)

## License

[MIT](LICENSE)
