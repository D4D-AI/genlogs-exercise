# Timeline / Hours

Time tracking for the Genlogs technical exercise.

## Estimate vs. actual

**PROPOSED — ~8 focused hours (range 6–10)**
- Design docs: ~1h
- Backend (FastAPI): ~1.5h
- Frontend (React + Google Maps): ~3h
- Deploy (AWS): ~1.5h
- OpenSpec, prompts, and README: ~1h

**SPENT — ~6 hours**
- Design docs: ~1h
- Backend (FastAPI): ~1h
- Frontend (React + Google Maps): ~2h
- Deploy (AWS): ~1h
- OpenSpec, prompts, and README: ~1h

### Why actual came in at the low end of the range
The estimate already assumed AI-assisted development (as stated in the up-front email), with
time budgeted for verification and integration. It still landed at the bottom of the range
(~6h vs the ~8h center), for two reasons:

- **The agent absorbed the AWS/Google friction I'd budgeted to fight by hand.** The snags did
  materialize — this account blocks App Runner and public Lambda Function URLs, and Google's
  legacy Places autocomplete and city-name matching needed handling — but the agent diagnosed
  and routed around them quickly (Lambda + API Gateway; backend city-name normalization)
  instead of them becoming the multi-hour time sinks they were budgeted as.
- **Spec-driven development kept the agent's context sharp between turns.** With the proposal,
  specs, design, and tasks written down, the agent re-grounded itself from the spec each turn
  rather than re-deriving intent — which kept velocity high and rework low.

