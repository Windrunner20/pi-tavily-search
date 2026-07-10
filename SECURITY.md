# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.x | Yes |
| < 1.0 | No |

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting for this repository. Do not open a public issue for API-key exposure, arbitrary file access, prompt-injection bypasses, unsafe temporary-file behavior, or denial-of-service vulnerabilities.

Include reproduction steps, affected version, impact, and any proposed mitigation. You should receive an acknowledgement within 7 days.

## Security model

- The extension runs with the same operating-system permissions as Pi.
- Tavily search results and linked pages are untrusted external data, not instructions.
- The extension sends the query and selected search options to `https://api.tavily.com/search`.
- The Tavily API key is read locally and sent only in the Tavily Authorization header.
- API error bodies are bounded and marked as untrusted before reaching the model.
- Requests have a 30-second default deadline, configurable with `TAVILY_REQUEST_TIMEOUT_MS` between 100ms and 120s.
- Raw responses are stored in private temporary files only when explicitly requested or when a digest is truncated.
- Session artifacts are removed on clean session shutdown; stale artifacts older than 24 hours are removed on session start.
- A local user with the same account permissions can still read Pi configuration and temporary files. This extension does not attempt to defend against a compromised local account.
