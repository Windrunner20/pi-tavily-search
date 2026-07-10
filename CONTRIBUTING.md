# Contributing

Contributions are welcome.

## Development

```bash
git clone https://github.com/Windrunner20/pi-tavily-search.git
cd pi-tavily-search
npm ci
npm run check
```

Run the optional live integration test with a Tavily key:

```bash
TAVILY_API_KEY=tvly-... npm run test:integration
```

## Pull requests

- Add or update tests for every behavior change.
- Run `npm run check` before submitting.
- Update `CHANGELOG.md` for user-visible changes.
- Do not commit API keys, captured private pages, or generated raw artifacts.
- Preserve the public v1 tool and command names unless the change is intentionally breaking.
- Keep model-visible web output bounded and explicitly marked as untrusted.

## Design principles

The extension exposes one small public seam: install it into Pi, then use `tavily_search` and its commands. Configuration and artifact behavior should remain observable through that seam; avoid exposing internal formatting, budget, or transport modules as public interfaces.
