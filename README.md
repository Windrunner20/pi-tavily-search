# Pi Tavily Search

[![CI](https://github.com/Windrunner20/pi-tavily-search/actions/workflows/ci.yml/badge.svg)](https://github.com/Windrunner20/pi-tavily-search/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Windrunner20/pi-tavily-search)](https://github.com/Windrunner20/pi-tavily-search/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-oriented [Pi](https://pi.dev) extension for Tavily web search with strict context budgets, source URLs, prompt-injection guidance, and out-of-context raw artifacts.

## Why this exists

Unbounded web-search results can consume an agent's context window. Real-world testing of the original extension found individual Tavily tool results as large as **13MB**, mainly because raw page content entered both the model-visible result and persisted details.

This package keeps useful search evidence in context while moving complete raw responses to private temporary files that Pi can inspect incrementally.

## Features

- `tavily_search` tool with `basic`, `advanced`, `fast`, and `ultra-fast` modes.
- 8KB maximum model-visible output per call.
- 16KB shared budget across parallel searches in one Pi turn.
- Five results by default, ten maximum.
- Raw page content never enters chat output or tool details.
- Complete responses saved as `0600` temporary JSON artifacts when raw content is requested or the digest is truncated.
- Session and stale-artifact cleanup.
- Search results explicitly marked as untrusted external data.
- Google-compatible string-enum schema.
- Commands for status, default depth, and artifact cleanup.

## Requirements

- Pi coding agent `0.80.6` or later.
- Node.js 22 or later.
- A [Tavily API key](https://tavily.com/) for normal keyed access.

## Installation

Install the tagged GitHub release:

```bash
pi install git:github.com/Windrunner20/pi-tavily-search@v1.0.0
```

Restart Pi after installation. To try without installing:

```bash
pi -e git:github.com/Windrunner20/pi-tavily-search@v1.0.0
```

For local development:

```bash
pi install /absolute/path/to/pi-tavily-search
```

## Configuration

### API key

The extension checks these locations in order:

1. `TAVILY_API_KEY`
2. `$PI_CODING_AGENT_DIR/tavily-api-key`
3. `~/.tavily-api-key`

Normally Pi's agent directory is `~/.pi/agent`, so a private key file can be created with:

```bash
install -m 600 /dev/null ~/.pi/agent/tavily-api-key
printf '%s\n' 'tvly-YOUR-KEY' > ~/.pi/agent/tavily-api-key
chmod 600 ~/.pi/agent/tavily-api-key
```

The key is sent only to `https://api.tavily.com/search` in the `Authorization: Bearer` header.

- `TAVILY_REQUEST_TIMEOUT_MS` — request deadline in milliseconds, clamped to 100–120000; default 30000

### Default search depth

Set it for the current process:

```bash
export TAVILY_SEARCH_DEPTH=basic
```

Or use Pi:

```text
/tavily-depth advanced
```

The command writes `$PI_CODING_AGENT_DIR/tavily-search.json`.

Precedence:

1. `TAVILY_SEARCH_DEPTH`
2. `tavily-search.json`
3. `basic`

## Tool interface

```text
tavily_search({
  query: string,                    // 1-400 characters
  search_depth?: "basic" | "advanced" | "fast" | "ultra-fast",
  max_results?: integer,            // 1-10, default 5
  include_answer?: boolean,         // default true
  include_raw_content?: boolean,    // default false
  include_images?: boolean          // default false
})
```

Example request the model may issue:

```json
{
  "query": "Pi coding agent extension documentation",
  "search_depth": "advanced",
  "max_results": 5,
  "include_answer": true,
  "include_raw_content": false
}
```

## Commands

### `/tavily-status`

Reports whether an API key is available and displays the active default search depth.

### `/tavily-depth [depth]`

Displays or changes the default depth:

```text
/tavily-depth
/tavily-depth basic
/tavily-depth advanced
/tavily-depth fast
/tavily-depth ultra-fast
```

### `/tavily-clean`

Deletes raw-response artifacts created by the current session.

## Context and artifact behavior

### Compact output

The model sees:

- a warning that the content is untrusted;
- a clipped Tavily answer;
- titles, URLs, relevance scores, and clipped snippets;
- at most 8KB per call;
- at most 16KB across searches in one turn.

If parallel searches reserve the full turn budget, later searches are skipped rather than overflowing context.

### Raw output

When `include_raw_content` is true, Tavily receives `include_raw_content: "markdown"`, but raw page content is not returned to the model. The complete response is written to a path like:

```text
/tmp/pi-tavily-XXXXXX/result.json
```

The JSON begins with an explicit untrusted-content warning. Pi can use its `read` tool with `offset` and `limit` to inspect the artifact incrementally.

Artifacts:

- are created with mode `0600`;
- are removed on clean session shutdown;
- can be removed manually with `/tavily-clean`;
- are considered stale and removed after 24 hours on session start.

## Security

Web pages can contain prompt-injection text. This extension adds both system-level guidance and a result-level warning telling the model to treat search content only as evidence, never as instructions.

This is defense in depth, not a guarantee. Review [SECURITY.md](SECURITY.md) before deploying the package in environments with secrets or powerful tools.

## Development

```bash
npm ci
npm run typecheck
npm test
npm run pack:check
```

Optional live Tavily test:

```bash
TAVILY_API_KEY=tvly-... npm run test:integration
```

Run the complete offline release gate:

```bash
npm run check
```

## Compatibility and versioning

The stable v1 interface consists of:

- tool name `tavily_search`;
- commands `tavily-status`, `tavily-depth`, and `tavily-clean`;
- documented environment variables and config files;
- bounded output and private-artifact behavior.

Breaking these contracts requires a new major version.

## License

[MIT](LICENSE)
