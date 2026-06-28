# Change: build-genlogs-portal

## Why
The Genlogs portal does not exist yet. A user needs a single page to enter an origin and
destination city and see the carriers moving the most trucks between them, with the
candidate routes shown on a map. This change delivers that end to end (React frontend +
FastAPI backend over a fixed dataset), deployed to a public URL, built spec-first so the
spec, prompts, and rules are committed alongside the code.

## What Changes
- ADD a `carrier-search-api` capability: a FastAPI endpoint that accepts an
  origin/destination city pair and returns the matching carriers, sorted by trucks/day,
  covering the two known routes plus a default.
- ADD a `portal-web-ui` capability: a single-page React app with Google Maps city
  autocomplete, a Search button, an embedded map showing up to 3 fastest routes, and a
  carrier list rendered from the API.
- ADD deployment to AWS plus repo hygiene (README, committed spec, prompts, rules,
  actual-vs-estimated time note).

## Impact
- New capabilities: `carrier-search-api`, `portal-web-ui`.
- New code: `/backend`, `/frontend`.
- **Human prerequisites** before the agent can finish: a Google Maps API key and an AWS
  account with deploy credentials. The agent cannot create these (see `design.md` and the
  prerequisites section of `tasks.md`).
- Out of scope: database, auth, image capture, CV detection, SAFER FMCSA integration,
  CI/CD, IaC, autoscaling.
