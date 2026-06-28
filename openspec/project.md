# Project Context: Genlogs Carrier Portal

## Purpose
A web portal where a user enters an origin and destination city and sees which carriers
move the highest volume of trucks between them, with the candidate routes drawn on a map.
This repository implements the **portal slice** of the Genlogs platform. The broader
platform (highway-camera capture, plate/USDOT/logo detection, SAFER FMCSA enrichment) is
covered in the written design docs and is out of scope for the code here.

## Tech stack
- **Frontend:** React 18 + Vite + TypeScript. Google Maps JavaScript API via
  `@vis.gl/react-google-maps` (Places Autocomplete + Directions), client-side only.
- **Backend:** Python 3.11 + FastAPI + Uvicorn, Pydantic models.
- **No database:** carrier data is an in-memory lookup (see Carrier dataset below).
- **Deployment:** AWS (static hosting for the frontend, a container/managed service for
  the API). Manual setup steps live in the active change's `design.md`.

## Repository layout
```
/frontend      React app (Vite)
/backend       FastAPI app
/openspec      specs and change proposals (this tool)
README.md      run + deploy instructions
```

## Conventions
- **Spec-driven:** no production code is written before the relevant change under
  `openspec/changes/` is approved. After implementation the change is archived and
  `openspec/specs/` becomes the new source of truth.
- Requirements use SHALL/MUST. Every requirement has at least one `#### Scenario:`.
- **MVP bias:** ship a working first version over production hardening. Record next-phase
  items rather than building them.
- All secrets come from environment variables. Never commit keys or `.env` files.
- **Tests** live in each app's `tests/` directory (`backend/tests/`, `frontend/tests/`),
  separate from source.

## Carrier dataset (source of truth)
City matching is case-insensitive and trims surrounding whitespace. It also normalizes
common city-name variants to the canonical cities below so the known routes are reachable
from Google Places autocomplete labels: a `City, State, Country` value is reduced to its
leading city component, "New York"/"NYC" map to "New York City", and "Washington"/"Washington
D.C." map to "Washington DC". Carriers are always returned sorted by trucks/day, descending.

| From | To | Carriers (trucks/day) |
|------|----|----|
| New York City | Washington DC | Knight-Swift Transport Services (10), J.B. Hunt Transport Services Inc (7), YRC Worldwide (5) |
| San Francisco | Los Angeles | XPO Logistics (9), Schneider (6), Landstar Systems (2) |
| any other pair | any other pair | UPS Inc. (11), FedEx Corp (9) |

## Environment variables
- Frontend: `VITE_GOOGLE_MAPS_API_KEY`, `VITE_API_BASE_URL`
- Backend: `ALLOWED_ORIGINS` (comma-separated frontend origins, for CORS)
