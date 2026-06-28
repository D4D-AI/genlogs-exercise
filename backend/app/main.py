"""FastAPI app for the Genlogs carrier search API.

Stateless service over an in-memory carrier lookup. All Google Maps work (autocomplete,
map, directions) is client-side, so this service needs no Google key.
"""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from .dataset import lookup_carriers
from .models import SearchRequest, SearchResponse

app = FastAPI(title="Genlogs Carrier Search API")

# CORS allow-list comes from the environment (comma-separated). Defaults to the Vite dev
# server origin so local development works out of the box.
_allowed = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in _allowed.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/search", response_model=SearchResponse)
def search(request: SearchRequest) -> SearchResponse:
    carriers = lookup_carriers(request.from_city, request.to_city)
    return SearchResponse(carriers=carriers)


# AWS Lambda entrypoint (used by the Lambda container image / Function URL deploy).
# Uvicorn still serves the same `app` for local dev and the plain Docker image.
handler = Mangum(app)
