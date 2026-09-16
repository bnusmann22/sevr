# SeVR: Scoped Enclave for Varsity Research

ICSC 2026 Universities Hackathon: Track F1, Protecting University Research.
See `docs/` for the Project Charter and Product Requirements Document.

## Current status

Frontend is being built now, against a mocked API (MSW), so UI work isn't
blocked on the backend. Backend (`api/`) will be built next: data shapes
the backend must match live in `frontend/src/types/index.ts` and
`frontend/src/mocks/handlers.ts`.

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

## Quick start: full stack (once the backend exists)

```bash
cp .env.example .env
docker compose up --build   # Nextcloud, Postgres, Keycloak (+ api, once uncommented)
cd frontend && npm install && npm run dev
```

Then in `frontend/.env`, set `VITE_USE_MOCKS=false` and point
`VITE_API_BASE_URL` at the running API.

## Repo structure

```
sevr/
├── docker-compose.yml
├── .env.example
├── api/            # FastAPI backend (not yet built)
├── detection/       # leak-detection pipeline (pandas/scikit-learn)
├── watermark/        # per-copy watermarking
├── sevr_format/      # .sevr container encode/decode
├── db/              # migrations / schema
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
