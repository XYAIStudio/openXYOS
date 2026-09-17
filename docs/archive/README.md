# Archived XYOS materials

These files are **not** part of the openXYOS community runtime. They are kept only as historical reference from the commercial XYOS line.

| Path | Why it is archived |
| --- | --- |
| `XYOS-CHANGELOG.md` | Commercial XYOS 4.x / 0.4.5.x upgrade notes. The public changelog is `/CHANGELOG.md`. |
| `commercial-backend/` | Tenant catalog and `/api/module-settings` implementation that listed OA, assets, contracts, and other commercial modules. Live traffic uses `backend/open-module-catalog.ts` and `backend/routes/open-module-settings.ts`. |
| `commercial-frontend/` | Unused commercial App shell, sidebar, module store, workflow designer, and pages that `OpenApp` never imported. |

Do not re-mount these files as the public product surface. Trademark, patent, and Apache-2.0 boundary documents stay in the repository root and `docs/governance/`.
