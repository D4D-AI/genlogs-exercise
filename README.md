# Genlogs Carrier Portal

A user enters an origin and destination city and sees which carriers move the most trucks
between them, with the candidate driving routes drawn on a Google Map.

This repo is the **portal slice**. The broader platform — highway-camera capture, plate/USDOT/
logo detection, SAFER FMCSA enrichment, storage — is *designed* in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/DATABASE.md`](docs/DATABASE.md), not
built here.

## How it's built

- **Spec-driven** (OpenSpec) — proposal → specs → implementation → archived; the living
  capability specs are in [`openspec/specs/`](openspec/specs/).
- **Backend** — Python + FastAPI over a fixed in-memory carrier lookup, no database.
  [`backend/`](backend/)
- **Frontend** — React 18 + Vite + TypeScript with Google Maps (Places autocomplete +
  Directions, client-side). [`frontend/`](frontend/)
- **Tested** — 8 backend + 20 frontend automated tests.
- **Deployed + verified on AWS** (Lambda + API Gateway, S3 + CloudFront), then torn down to
  avoid charges — this is a demo, not a standing service.

## What it returns

| From | To | Carriers (trucks/day) |
|------|----|----|
| New York City | Washington DC | Knight-Swift Transport Services (10), J.B. Hunt Transport Services Inc (7), YRC Worldwide (5) |
| San Francisco | Los Angeles | XPO Logistics (9), Schneider (6), Landstar Systems (2) |
| any other pair | — | UPS Inc. (11), FedEx Corp (9) |

City matching is case-insensitive, trims whitespace, and normalizes common Google Places
labels (e.g. "New York" → "New York City"); carriers are sorted by trucks/day, descending.

## Run locally

**Backend** — http://localhost:8000

```bash
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000     # tests: pytest
```

**Frontend** — http://localhost:5173

```bash
cd frontend && npm install
cp .env.example .env    # set VITE_GOOGLE_MAPS_API_KEY, VITE_API_BASE_URL=http://localhost:8000
npm run dev             # tests: npm test
```

A Google Maps key (Maps JavaScript + Places + Directions APIs) powers autocomplete and the
map; the carrier search itself works without it.

## Deployment

Deployed to AWS `us-west-2`, verified end-to-end (all three routes, CORS, HTTPS), and **live
for the review period**. The live URL is shared with the reviewer directly rather than
committed here — the Maps key is embedded in the browser bundle, so keeping the URL out of the
public repo avoids casual abuse; the environment is torn down after review. Stack:

- **Backend** — FastAPI as a Lambda container image (Mangum) behind an API Gateway HTTP API.
  (App Runner and public Lambda Function URLs are both blocked on this account, hence this path.)
- **Frontend** — Vite build in a private S3 bucket via CloudFront (HTTPS, SPA routing).

The deploy was imperative (AWS CLI); IaC is deferred (see below). The full deploy + teardown
steps are in the change's
[`design.md`](openspec/changes/archive/2026-06-27-build-genlogs-portal/design.md).

## Scope and next phase

Optimized for a **clean, working first version** over production hardening — a deliberate
choice stated in the up-front plan. These were consciously **deferred and documented, not
built**:

- **CI/CD** and **lint/format + pre-commit** — `tsc --strict` is in place; GitHub Actions and
  `ruff`/`eslint` are the next step.
- **Infrastructure as code** — Terraform/CDK in place of the manual CLI deploy.
- **Observability** — metrics, structured logging, tracing (only `/health` today).
- **Maps hardening + API migration** — referrer-restrict the key (kept permissive for the
  demo) and move off the deprecated legacy `Autocomplete` / `DirectionsService`.
- **End-to-end tests** — Playwright/Cypress (today: unit + integration only).
- **The data platform itself** — capture, CV detection, FMCSA enrichment, and a real database.
  The portal uses an in-memory dataset per the brief; the platform is designed in
  [`docs/`](docs/), not built.
