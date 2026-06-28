"""Pydantic request/response models for the carrier search API."""

from __future__ import annotations

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    from_city: str = Field(..., description="Origin city")
    to_city: str = Field(..., description="Destination city")


class Carrier(BaseModel):
    name: str
    trucks_per_day: int


class SearchResponse(BaseModel):
    carriers: list[Carrier]
