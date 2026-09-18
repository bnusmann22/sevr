# SeVR: Scoped Enclave for Varsity Research

ICSC 2026 Universities Hackathon: Track F1, Protecting University Research.
See `docs/` for the Project Charter and Product Requirements Document.

## Current status

Frontend UI work continues against MSW, while the local FastAPI foundation
and Docker infrastructure are now available. Domain endpoints will be added
incrementally: data shapes the backend must match live in
`frontend/src/types/index.ts` and `frontend/src/mocks/handlers.ts`.

## Quick start: frontend only (what you need right now)

```bash
cd frontend
npm install
cp ../.env.example .env    # VITE_USE_MOCKS=true by default
npm run dev
```

Opens at `http://localhost:5173`. Every screen (workspace, upload,
export/share, audit trail) works against realistic mock data; no backend
or Docker required for this.

### Default mock login

When `VITE_USE_MOCKS=true`, sign in with:

- Email: `researcher@bayero.edu.ng`
- Password: `SeVRdemo2026!`

This supervisor account exists only in the MSW development handler and is not
used when the frontend points to a real API.

## Quick start: local full stack

On Windows PowerShell, the Phase 0 bootstrap command starts Docker Desktop when
needed, validates Compose, builds the API, and starts PostgreSQL, Nextcloud,
Keycloak, and FastAPI:

```powershell
.\scripts\phase-0.ps1
# After the first successful boot, create the least-privileged local storage account:
.\scripts\phase-0.ps1 -CreateNextcloudServiceAccount
```

The script creates `.env` from `.env.example` only when it is absent. Replace
every `change-me-*` value before using any environment outside your machine.

Equivalent manual commands:

```bash
cp .env.example .env
docker compose up -d --build   # Postgres, Nextcloud, Keycloak, and FastAPI
sh scripts/create-nextcloud-service-account.sh
docker compose exec api alembic upgrade head
curl http://localhost:8000/health/ready
cd frontend && npm install && npm run dev
```

Then in `frontend/.env`, set `VITE_USE_MOCKS=false` and point
`VITE_API_BASE_URL` at the running API.

The local services are available at:

- FastAPI: `http://localhost:8000`
- Nextcloud: `http://localhost:8080`
- Keycloak: `http://localhost:8081`
- PostgreSQL: `localhost:5432`

See [Implementation.md](Implementation.md) for migration, Keycloak/PKCE,
Nextcloud credentials, JWT validation, health-check, and secret-rotation procedures.

## Repo structure

```
sevr/
├── docker-compose.yml
├── .env.example
├── api/            # FastAPI backend and Alembic migrations
├── detection/       # leak-detection pipeline (pandas/scikit-learn)
├── watermark/        # per-copy watermarking
├── sevr_format/      # .sevr container encode/decode
├── db/              # database-related assets
├── frontend/         # React + TypeScript + Tailwind + MSW mocks
└── docs/            # Project Charter, PRD
```

## Handoff note for backend work

The frontend assumes these endpoints (see `frontend/src/mocks/handlers.ts`
for exact request/response shapes):

- `GET /projects`
- `GET /projects/:id/files`
- `POST /files/:id/export`: implements the TLP decision table in the PRD, Section 5.1
- `GET /projects/:id/audit`

Match those shapes and the frontend needs no changes beyond flipping
`VITE_USE_MOCKS` to `false`.
