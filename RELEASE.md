# Release checklist

## Automated gate

- [ ] `npm ci`
- [ ] `npm run check`
- [ ] `TAVILY_API_KEY=... npm run test:integration`
- [ ] `npm audit --omit=dev`

## Metadata

- [ ] `package.json` version matches the intended tag
- [ ] `CHANGELOG.md` contains the release date and notes
- [ ] README install command points to the intended tag
- [ ] No secrets or private captured artifacts are tracked

## Runtime smoke test

- [ ] Install the package into a clean Pi agent directory
- [ ] Missing-key error is clear
- [ ] `/tavily-status` reports configured state
- [ ] `/tavily-depth` persists a depth
- [ ] Normal search returns URLs under 8KB
- [ ] Raw search creates a private artifact and keeps raw content out of chat
- [ ] Three parallel searches stay under 16KB model-visible output
- [ ] `/tavily-clean` removes session artifacts

## GitHub

- [ ] CI passes on `main`
- [ ] Tag is signed or created from the reviewed release commit
- [ ] GitHub Release contains the `.tgz` artifact
- [ ] Release notes mention security and context-budget behavior
