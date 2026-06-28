# Tasks: build-genlogs-portal

## 0. Human prerequisites (MANUAL: the agent cannot do these; see design.md)
- [x] 0.1 Create a Google Maps API key with Maps JavaScript API, Places API, and
      Directions API enabled; restrict it by HTTP referrer; set a budget cap.
- [x] 0.2 Provide the key to the frontend build as `VITE_GOOGLE_MAPS_API_KEY`.
- [x] 0.3 Create/access an AWS account, set a budget alert, create a `genlogs-deployer`
      IAM user with an access key, and run `aws configure`.
- [x] 0.4 Confirm `aws sts get-caller-identity` returns the deployer identity.

## 1. Backend (carrier-search-api)
- [x] 1.1 Scaffold `/backend` (FastAPI + Uvicorn + Pydantic) with `requirements.txt` and `.env.example`.
- [x] 1.2 Add a dataset module: two known routes plus the default, with trim + lowercase matching.
- [x] 1.3 Implement `POST /api/search` returning carriers sorted by `trucks_per_day` descending.
- [x] 1.4 Add request/response Pydantic models; missing fields return HTTP 422.
- [x] 1.5 Add `GET /health`.
- [x] 1.6 Configure CORS from `ALLOWED_ORIGINS`.
- [x] 1.7 Add tests: NYC->DC, SF->LA, a default pair, case/whitespace matching, sorting, and the 422 case. (7 tests, all passing)

## 2. Frontend (portal-web-ui)
- [x] 2.1 Scaffold `/frontend` (Vite + React + TypeScript) with `.env.example`.
- [x] 2.2 Build the single page: From input, To input, Search button, results region, map region.
- [x] 2.3 Wire Google Places autocomplete on both city inputs. (code complete; runtime needs a Maps key — task 0.1/0.2)
- [x] 2.4 On Search, POST to `${VITE_API_BASE_URL}/api/search` and render the carrier list (name + trucks/day, in returned order).
- [x] 2.5 Render the embedded map with up to 3 route alternatives between the two cities. (code complete; runtime needs a Maps key)
- [x] 2.6 Add loading and error states.
- [x] 2.7 Add frontend tests (Vitest + RTL): API client contract, carrier rendering, search loading/results/error states, and fastest-3-route selection (`selectFastestRoutes`). 11 tests passing.
- [x] 2.8 Show each route's travel time + distance in a selectable list (`RouteList`); selecting a route highlights it on the map with no new Directions request. 20 frontend tests passing.

## 3. Integration + verification
- [x] 3.1 Run backend and frontend locally; verify NYC->DC, SF->LA, and a default pair end to end. (verified locally: both servers run; data path confirmed for all three cases with CORS from the localhost:5173 origin; a real in-browser search completed end to end.)
- [x] 3.2 Verify autocomplete suggests cities and the map shows up to 3 routes. (verified in-browser: city autocomplete returned suggestions; the map rendered driving routes — `DirectionsService`/`DirectionsRenderer` ran with no Maps load errors.)
- [x] 3.3 Confirm CORS passes between the two local origins. (preflight returns `Access-Control-Allow-Origin: http://localhost:5173`)

## 4. Deploy + repo hygiene
- [x] 4.1 Deploy the backend to AWS; record the HTTPS URL. (App Runner blocked on this account — `SubscriptionRequiredException` — so used Lambda container image + API Gateway HTTP API: https://9kf5gxv36d.execute-api.us-west-2.amazonaws.com)
- [x] 4.2 Deploy the frontend to AWS (S3 + CloudFront) with `VITE_API_BASE_URL` set to the backend URL. (https://d3e2e1rw4byggi.cloudfront.net)
- [x] 4.3 Set backend `ALLOWED_ORIGINS` to the frontend URL — done, scoped + verified. Maps key left permissive (no referrer restriction) as a deliberate demo choice (see README "Scope and next phase").
- [x] 4.4 Smoke test the live URL across all three cases. (API verified live for NYC->DC, SF->LA, default, 422, /health, and CORS; in-browser map render pending the Maps referrer allowlist above.)
- [x] 4.5 Write the README (run + deploy + live URLs + teardown). (Committing the change/prompts/rules and the actual-vs-estimated time note are repo/author steps.)
- [x] 4.6 After review, tear down the AWS resources. (done — all resources deleted; runbook in README "Teardown".)
