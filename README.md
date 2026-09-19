# SeVR 1.0: Scoped Enclave for Varsity Research

> **ICSC 2026 Universities Hackathon: Track F1 — Protecting University Research**  
> **Authority:** System Implementation Specification & Senior Architectural Blueprint  
> **Reference Documents:** `docs/SeVR_1.0_Project_Charter.docx`, `docs/SeVR_Platform_PRD.docx`, `Implementation.md`, `QA_Report.md`, `bug_Report.md`

---

## 1. Executive Overview

**SeVR (Scoped Enclave for Varsity Research)** is a zero-trust research enclave platform specifically architected for tertiary institutions. It provides isolated computational, storage, and egress governance boundaries for sensitive academic datasets, pathogen genomics, field surveys, and institutional intellectual property.

The platform is built on four core security layers:
1. **Vault Layer:** Multi-tenant isolated file storage hosted on Nextcloud WebDAV with SHA-256 cryptographic checksum verification.
2. **Detection Layer:** Real-time behavioral threat analytics and egress anomaly detection (Isolation Forest / Z-score velocity scoring).
3. **Controlled Sharing Layer:** Release governance enforcing **FIRST Standards TLP 2.0** (`CLEAR`, `GREEN`, `AMBER`, `AMBER+STRICT`, `RED`), mandatory preview-before-share inspection gates, recipient dynamic watermarking, and proprietary `.sevr` cryptographic container encapsulation (AES-256-GCM + Ed25519).
4. **Accountability Layer:** Cryptographically linked, SHA-256 hash-chained, tamper-evident audit logging with authenticated principal attribution.

### Structural Architecture: Track A vs. Track B Segregation

The system architecture is strictly partitioned into two operational tracks:

* **Track A — Public Website & Educational Showcase (Unauthenticated):**
  Lightweight, static informational surfaces requiring zero authorization with zero access to enclave datasets.
  * *Routes:* `/` (Overview), `/security` (TLP 2.0 Matrix Simulator), `/workflows` (Workflow Demonstrator), `/sevr` (`.sevr` Format Inspector), `/about` (Varsity Charter), `/docs` (Documentation).
* **Track B — Core Operational Platform (Authenticated Enclave Shell):**
  Security-critical workspace space initiated at the authentication gateway (Keycloak OIDC / institutional credentials).
  * *Routes:* `/login`, `/home` (Enclave Catalog), `/projects/:id` (Project Workspace), `/projects/:id/files/:fileId/preview` (Mandatory Preview), `/projects/:id/files/:fileId/release` (Release Review), `/share/:token` (Scoped External Portal), `/audit` (Tamper-Evident Audit Trail), `/alerts` (Zero-Trust Anomaly Queue).

---

## 2. Global System Topology & Container Services

The SeVR production topology is comprised of five coordinated service containers running inside an isolated Docker bridge network (`sevr_network`), orchestrated via `docker-compose.yml`:

| Service Component | Internal URL | Host Port Mapping | Administrative Interface / Docs |
| :--- | :--- | :--- | :--- |
| **FastAPI Core API** | `http://api:8000` | `localhost:8000` | OpenAPI Swagger: `http://localhost:8000/docs` |
| **Keycloak IdP** | `http://keycloak:8080` | `localhost:8081` | Admin Console: `http://localhost:8081/admin/` |
| **Nextcloud WebDAV Vault** | `http://nextcloud:80` | `localhost:8080` | Web Dashboard: `http://localhost:8080` |
| **PostgreSQL 16 DB** | `postgresql://db:5432` | `localhost:5432` | Direct `psql` / DBeaver |
| **Frontend SPA** | N/A (Vite Dev Server) | `localhost:5173` | Web App: `http://localhost:5173` |

---

## 3. System Requirements & Prerequisites

Before running SeVR, ensure your machine satisfies the following prerequisites:

- **Node.js:** v18.0.0 or higher (`node -v`)
- **npm:** v9.0.0 or higher (`npm -v`)
- **Python:** v3.12 or higher (`python --version`)
- **Docker Desktop & Docker Compose:** Required for full-stack execution (`docker compose version`)
- **PowerShell** (Windows) or **Bash** (Linux/macOS)

---

## 4. Quick Start Guide & Execution Modes

SeVR supports two operational development modes: **Standalone Frontend Mode** (fast UI development with MSW mocks) and **Full-Stack Mode** (complete containerized backend services).

### Mode 1: Standalone Frontend Execution (Mock Engine)

This mode runs the React Single Page Application against an in-browser Mock Service Worker (MSW) engine. No Docker or backend setup is required.

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Copy default mock configuration
cp ../.env.example .env    # VITE_USE_MOCKS=true by default

# 4. Start local Vite development server
npm run dev
```

Open your browser at **`http://localhost:5173`**.

#### Default Development Credentials (Mock Engine):
| Role / Cadre | Email | Password |
| :--- | :--- | :--- |
| **Supervisor / PI** | `researcher@bayero.edu.ng` | `SeVRdemo2026!` |
| **System Admin** | `admin@bayero.edu.ng` | `SeVRdemo2026!` |
| **Researcher (MSc)** | `jamil@bayero.edu.ng` | `SeVRdemo2026!` |

> [!NOTE]
> All emails require valid institutional domains (`@*.edu.ng` or `@*.edu`). Commercial email domains (`@gmail.com`, `@yahoo.com`) are rejected by enclave security policy.

---

### Mode 2: Full-Stack Execution (Docker + FastAPI + Keycloak + Nextcloud)

This mode starts all five containerized infrastructure services and connects the frontend SPA directly to the Python FastAPI backend and PostgreSQL relational storage.

#### Option A — Automated PowerShell Bootstrap (Windows Recommended)

On Windows PowerShell, run the Phase 0 automated bootstrap script:

```powershell
# 1. Start Docker Desktop, validate Compose, and boot services
.\scripts\phase-0.ps1

# 2. Provision least-privileged Nextcloud WebDAV service account (first-time boot only)
.\scripts\phase-0.ps1 -CreateNextcloudServiceAccount
```

#### Option B — Manual Docker Compose Startup (Cross-Platform)

```bash
# 1. Prepare environment file
cp .env.example .env

# 2. Boot all containerized services in background
docker compose up -d --build

# 3. Provision Nextcloud service account
sh scripts/create-nextcloud-service-account.sh

# 4. Apply database migrations
docker compose exec api alembic upgrade head

# 5. Verify FastAPI readiness
curl http://localhost:8000/health/ready
# Output: {"status":"ready"}

# 6. Configure frontend to connect to live backend API
cd frontend
cp ../.env.example .env
```

In `frontend/.env`, set:
```env
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:8000
```

Start the frontend application:
```bash
npm run dev
```

---

## 5. Repository Directory Structure

```
sevr/
├── docker-compose.yml              # Production/Dev Docker Compose topology
├── Implementation.md               # Senior Engineering Blueprint & Phase Specifications
├── QA_Report.md                    # QA Defect Log & Audit Traceability Matrix
├── bug_Report.md                  # Defect Tracking Ledger
├── README.md                       # Master System Documentation & Startup Guide
├── .env.example                    # Global environment variables template
│
├── api/                            # FastAPI Backend Subsystem
│   ├── app/
│   │   ├── main.py                 # Core API endpoints & RBAC routing
│   │   ├── auth.py                 # OIDC RS256 JWT decoding & RoleChecker
│   │   ├── models.py               # SQLAlchemy ORM database models
│   │   ├── db.py                   # Database connection pooling & SessionLocal
│   │   ├── config.py               # Pydantic v2 settings configuration
│   │   └── nextcloud.py            # WebDAV vault integration client
│   ├── migrations/                 # Alembic database migration scripts
│   └── Dockerfile                  # Container build recipe
│
├── sevr_format/                    # Proprietary .sevr Cryptographic Container Engine
│   ├── encoder.py                  # AES-256-GCM + Ed25519 container packager
│   ├── decoder.py                  # Signature verifier & payload unpacker
│   └── test_sevr_format.py         # Cryptographic unit test suite
│
├── detection/                      # Anomaly Detection & Threat Analytics Engine
│   └── pipeline.py                 # Behavioral anomaly algorithms & Z-score rules
│
├── watermark/                      # Forensic Watermarking Engine
│   └── engine.py                   # PDF & visual watermark overlay stamper
│
├── frontend/                       # React 18 + Vite SPA Subsystem
│   ├── src/
│   │   ├── api/                    # Axios REST client with Bearer token interceptor
│   │   ├── components/             # Reusable UI components (TLP, layout, preview)
│   │   ├── pages/                  # Track A showcase & Track B enclave screens
│   │   ├── mocks/                  # MSW standalone API mock handlers
│   │   ├── types/                  # TypeScript domain interfaces
│   │   └── App.tsx                 # Client-side router & loading boundaries
│   └── package.json
│
├── infra/                          # Infrastructure provisioning configs
│   └── keycloak/sevr-realm.json    # Keycloak OIDC realm import configuration
│
├── scripts/                        # Operational automation scripts
│   └── phase-0.ps1                 # Windows PowerShell environment bootstrap
│
└── docs/                           # Project Charter & PRD documents
```

---

## 6. Proprietary `.sevr` Cryptographic Container Specification

Assets exported under strict FIRST TLP 2.0 policies (`TLP:AMBER`, `TLP:AMBER+STRICT`, `TLP:RED`) are encapsulated inside `.sevr` container files to ensure zero unauthorized egress.

### `.sevr` Container Binary Layout:
1. **Magic Header (8 Bytes):** ASCII bytes `SEVR0100` (Version 1.0).
2. **Header Length Block (4 Bytes):** Big-endian uint32 specifying JSON header length.
3. **Release Metadata & Watermark Manifest (JSON Bytes):** Asset ID, filename, format, TLP label, issuing institution, recipient email, expiration datetime.
4. **Initialization Vector (12 Bytes):** Random cryptographic nonce for AES-256-GCM.
5. **Ciphertext Payload:** Research dataset encrypted with AES-256-GCM + 16-byte authentication tag.
6. **Digital Signature Block (64 Bytes):** Ed25519 digital signature of the entire preceding container, generated by the Enclave Signing Key.

To test container packaging locally:
```bash
python -m sevr_format.test_sevr_format
```

---

## 7. API Reference Summary

| Method | Route Path | Description | Access Boundary |
| :--- | :--- | :--- | :--- |
| `GET` | `/health/ready` | FastAPI backend readiness probe | Public |
| `POST` | `/api/auth/login` | Dual-mode credential authentication | Public |
| `GET` | `/api/auth/sso/start` | Keycloak OIDC PKCE redirect URL | Public |
| `GET` | `/projects` | Enclave catalog listing | Bearer JWT (Enclave Member) |
| `POST` | `/projects` | Create new research enclave | Bearer JWT (`supervisor` / `admin`) |
| `GET` | `/projects/{id}/files` | List project research assets | Bearer JWT (Enclave Member) |
| `POST` | `/projects/{id}/files` | Upload asset (Chunked WebDAV stream) | Bearer JWT (Enclave Member) |
| `POST` | `/files/{id}/export` | Evaluate FIRST TLP 2.0 export decision | Bearer JWT (Enclave Member) |
| `POST` | `/share/create` | Issue scoped external collaborator token | Bearer JWT (Enclave Member) |
| `GET` | `/share/{token}/validate` | Validate external share link status | Public (External Collaborator) |
| `GET` | `/share/{token}/download` | Stream binary asset or `.sevr` container | Public (External Collaborator) |
| `GET` | `/projects/{id}/audit` | Tamper-evident audit chain log | Bearer JWT (Enclave Member) |
| `GET` | `/alerts` | Zero-trust threat detection queue | Bearer JWT (`supervisor` / `admin`) |

---

## 8. Verification & Test Automation

Execute automated verification suites across frontend and backend:

### Frontend Type-Checking & Production Build Verification
```bash
npm --prefix frontend run build
```
*Executes TypeScript strict type check (`tsc -b`) and Vite production bundle compilation.*

### Backend Unit Tests & Container Cryptography Verification
```bash
# Test .sevr container encoding/decoding and Ed25519 signature checks
python -m sevr_format.test_sevr_format

# Run backend API test suite
pytest api/
```

---

*Maintained and Approved by Lead System Analyst and Senior Architect for SeVR 1.0.*
