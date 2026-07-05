from typing import Literal

from pydantic import BaseModel, Field


class Listing(BaseModel):
    source: str
    title: str
    price_aed: int
    year: int | None = None
    km: int | None = None
    condition: str | None = None
    seller: str | None = None
    url: str


class SourceResult(BaseModel):
    id: str
    name: str
    status: Literal["ok", "empty", "error", "blocked"]
    count: int = 0
    message: str | None = None
    search_url: str | None = None


class PriceSummary(BaseModel):
    count: int
    min_aed: int | None = None
    max_aed: int | None = None
    median_aed: int | None = None


class SearchResponse(BaseModel):
    query: str
    fetched_at: str
    cached: bool = False
    summary: PriceSummary
    sources: list[SourceResult]
    listings: list[Listing] = Field(default_factory=list)
