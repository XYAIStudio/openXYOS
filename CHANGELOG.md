# openXYOS changelog

Public community-edition notes only. This file is not a production-readiness claim.

Commercial XYOS 4.x / 0.4.5.x upgrade notes are archived at [docs/archive/XYOS-CHANGELOG.md](docs/archive/XYOS-CHANGELOG.md). License, trademark, and patent boundary documents are unchanged.

## 0.6.3 — 2026-09-17

Community identity alignment for the public 12-module edition.

### Identity

- Runtime, health, and operator-facing version strings now read **openXYOS 0.6.3** from `package.json`.
- Removed leftover public 4.5.x, 0.4.5.3, and `0.50.0-dev` product versions.
- Footer and signed-in sidebar show the same community version.

### Catalog and UI boundary

- `/api/module-settings` and the signed-in client remain on the open 12-module catalog (`workspace`, `announcements`, `organization`, `employees`, `skills`, `chat`, `agents`, `tasks`, `knowledge`, `reflections`, `governance`, `settings`).
- The commercial tenant catalog and unused commercial pages were quarantined under `docs/archive/`. They are not imported by `OpenApp`.

### Docs

- `CONTRIBUTING.md` now says openXYOS. CLA completion and `Signed-off-by` rules are unchanged.
- Architecture notes describe `OpenApp.tsx` as the community router.

## 0.6.0 — 2026-09-12

Public candidate baseline recorded in the open-source quality report: bilingual workspace, Agent Studio, 12-module runtime, and release-gate scans. Suitable for local development and evaluation. Not represented as production-ready.
