# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-07-10

### Added

- `tavily_search` with basic, advanced, fast, and ultra-fast search depths.
- Google-compatible tool schema and bounded query/result parameters.
- Compact citation-ready output with an 8KB per-call and 16KB per-turn budget.
- Private raw-response artifacts for raw or truncated searches.
- `/tavily-status`, `/tavily-depth`, and `/tavily-clean` commands.
- Environment and file-based API-key configuration.
- Session cleanup and stale-artifact cleanup.
- Unit, integration, type, and package validation.

### Security

- Search output is explicitly marked as untrusted external data.
- Raw page content never enters chat output or tool details.
- API error bodies are bounded before reaching the model.
- Tavily responses are limited to 32MB before parsing.
- Raw artifacts use `0600` permissions and are removed on session shutdown.

[Unreleased]: https://github.com/Windrunner20/pi-tavily-search/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Windrunner20/pi-tavily-search/releases/tag/v1.0.0
