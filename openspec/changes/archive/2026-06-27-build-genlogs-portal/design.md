# Design: build-genlogs-portal

## Architecture
A single-page React client calls a stateless FastAPI service.

```
Browser (React + Google Maps JS)
  | 1. Places Autocomplete on From/To  (Google, client-side)
  | 2. POST /api/search { from_city, to_city }
  v
FastAPI service  ->  in-memory carrier lookup  ->  JSON carrier list
  |
  | 3. Client renders the carrier list and an embedded map with up to
  |    3 fastest routes (Google Directions, client-side)
```

All Google Maps work (autocomplete, map, directions) is **client-side**, so the backend
needs no Google key. The backend only serves the carrier lookup.

## Key technical decisions
- `@vis.gl/react-google-maps` for the map and a Places autocomplete element: actively
  maintained and integrates more cleanly with React than the legacy `Autocomplete` widget.
- Routes via `DirectionsService` with `provideRouteAlternatives: true`, rendering the
  returned routes (up to 3; Google does not guarantee exactly 3).
- Backend matching: normalize each city (trim + lowercase) and look it up against a small
  dataset module, falling through to the default carriers.
- `POST` with a JSON body (not `GET` query params) so the contract is explicit and the
  Pydantic model gives free 422 validation.

## Config contract
- Frontend `.env`: `VITE_GOOGLE_MAPS_API_KEY`, `VITE_API_BASE_URL`
- Backend env: `ALLOWED_ORIGINS` (comma-separated CORS allow-list)
- Provide an `.env.example` in each app; never commit real `.env`.

## MANUAL PREREQUISITES (a human must do these; the agent cannot create accounts or keys)

### A. Google Maps API key
1. Open https://console.cloud.google.com and sign in.
2. Create a project (project selector -> New Project), e.g. `genlogs-portal`, and select it.
3. Enable billing: Billing -> link or create a billing account. Maps Platform requires
   billing even though it includes a recurring free monthly credit.
4. Enable APIs: APIs & Services -> Library, then enable **Maps JavaScript API**,
   **Places API** (and/or **Places API (New)**), and **Directions API**.
5. Create the key: APIs & Services -> Credentials -> Create credentials -> API key. Copy it.
6. Restrict the key (it ships to the browser, so this is the real protection):
   - Application restrictions -> Websites (HTTP referrers): add `http://localhost:5173/*`
     (Vite dev) and, once deployed, `https://<your-frontend-domain>/*`.
   - API restrictions -> Restrict key -> select the three APIs from step 4.
7. Cap cost: Billing -> Budgets & alerts -> create a budget (e.g. $10) with email alerts.
   Optionally set per-API quota limits under each API's Quotas page.
8. Put the key in `frontend/.env` as `VITE_GOOGLE_MAPS_API_KEY=...`. Do not commit `.env`.

   Note: a Maps JS key is necessarily public (it loads in the browser). Referrer + API
   restrictions + a budget cap are the safeguard, not secrecy.

### B. AWS account and deploy credentials
1. Create or sign in to an AWS account at https://aws.amazon.com and add a payment method.
2. Set a budget alert: Billing and Cost Management -> Budgets -> create (e.g. $10) so a
   misconfiguration cannot run up a surprise bill.
3. Do not deploy as the root user. Create a deployer identity:
   - IAM -> Users -> Create user (e.g. `genlogs-deployer`). For a throwaway demo account,
     attach `AdministratorAccess`; for a shared account, scope a policy to the services
     used below.
   - Security credentials -> Access keys -> Create access key (CLI use case). Copy the
     Access key ID and Secret access key.
4. Install the AWS CLI (https://docs.aws.amazon.com/cli/), then run `aws configure` and
   enter the access key, secret, a default region (e.g. `us-east-1`), and output format.
5. Verify: `aws sts get-caller-identity` returns the deployer identity.
6. Supply credentials only via the CLI config or environment. Never paste secrets into
   source, the spec, or the repo.

## Deployment to a public URL (AWS)
Goal: the API and the web app both reachable over public HTTPS, with the web URL shared as
the deliverable.

### Backend (FastAPI) on AWS Lambda + API Gateway
App Runner is the simplest first choice, but it is **blocked on this account**
(`SubscriptionRequiredException`); direct Lambda Function URLs are blocked too. So the
backend runs as a Lambda container image fronted by an API Gateway HTTP API:
1. Package the app with `Dockerfile.lambda` (FastAPI behind Mangum on the Lambda Python base
   image; `app.main.handler` is the entrypoint).
2. Create an ECR repo and push the image (build `--platform linux/amd64`):
   `aws ecr create-repository --repository-name genlogs-api`, then build, tag, and
   `docker push` to the repo URI.
3. Create a Lambda function from that image (execution role with
   `AWSLambdaBasicExecutionRole`), env var `ALLOWED_ORIGINS` (set the frontend URL once
   known; use a placeholder first).
4. Quick-create an API Gateway HTTP API with the Lambda as the integration target and grant
   it invoke permission. It returns a public HTTPS URL like
   `https://<id>.execute-api.<region>.amazonaws.com`. This is `VITE_API_BASE_URL`.

### Frontend (React build) on S3 + CloudFront
1. Build with env vars set: `VITE_API_BASE_URL` = the API Gateway URL,
   `VITE_GOOGLE_MAPS_API_KEY` = your key, then `npm run build` to produce `dist/`.
2. Create an S3 bucket and upload `dist/`.
3. Create a CloudFront distribution with that bucket as origin (Origin Access Control),
   default root object `index.html`, and a custom error response mapping 403/404 to
   `/index.html` (SPA routing). CloudFront returns a public HTTPS URL like
   `https://<id>.cloudfront.net`.

### Wire and verify
1. Set the backend `ALLOWED_ORIGINS` (the Lambda env var) to the CloudFront URL.
2. Add the CloudFront domain to the Google Maps key HTTP-referrer allow-list.
3. Open the CloudFront URL, run all three dataset cases, and confirm the map and carrier
   list load with no CORS errors in the console.
4. Share the CloudFront URL as the deliverable.

### Simpler alternative
AWS Amplify Hosting for the frontend (connect the repo, set the two `VITE_` vars, Amplify
gives a public URL) and Elastic Beanstalk for the backend (`eb init` / `eb create`, gives a
public URL). Same CORS + Maps-referrer wiring.

### Tear down
After review, delete the API Gateway, Lambda function, ECR repo, IAM role, CloudFront
distribution, and S3 bucket to stop charges.

## Out of scope
Image capture, CV/plate/USDOT/logo detection, SAFER FMCSA integration, database
persistence, authentication, CI/CD, IaC, autoscaling. These belong to the written
platform design, not this change.
