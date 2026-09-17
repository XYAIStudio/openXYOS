# Architecture overview

XYOS is currently a TypeScript application with a browser client and a single Node.js service.

```text
Browser / PWA
    |
    | HTTP JSON + WebSocket
    v
Express server
    |-- authentication and policy enforcement
    |-- tenant-scoped business routes
    |-- workflow, agent, knowledge, audit, and tool services
    |-- file storage
    `-- database adapter -> SQL.js for local development
```

## Frontend

`frontend/src/OpenApp.tsx` owns the community-edition routes. The signed-in shell uses the 12-module open catalog from `frontend/src/open-modules.ts` and `/api/module-settings`. Pages use a shared authenticated fetch layer and Zustand stores. Tenant module settings load once after authentication; the shared store controls sidebar visibility and guards disabled routes. Vite provides the development server, production bundle, and PWA assets. Commercial leftover pages are archived under `docs/archive/` and are not part of the public runtime.

## Backend

`backend/server.ts` creates the HTTP server, applies security middleware and rate limits, mounts feature routers, initializes the database, and starts WebSocket services. Route modules handle transport concerns; reusable business behavior belongs in `backend/services`.

## Data and isolation

The local default is SQL.js-backed SQLite. `tenant_module_settings` persists module visibility per tenant. Tenant administrators can update only their own tenant, while super administrators can target any existing tenant. Tenant-aware services must derive tenant and actor identity from authenticated server state, not client-supplied display fields. Production database adapters require separate migration and backup/restore acceptance.

## Security defaults

Runtime secrets are required. Demo seeding is opt-in and requires caller-provided passwords. API responses and uploads must remain tenant scoped. PWA configuration does not cache authenticated API responses.

