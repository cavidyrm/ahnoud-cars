from datetime import UTC, datetime

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .cache import TtlCache
from .models import PriceSummary, SearchResponse
from .sources.dubicars import search_dubicars
from .sources.dubizzle import search_dubizzle
from .stats import summarize_prices

app = FastAPI(title="Ahnoud Cars Market Scraper", version="1.0.0")
cache = TtlCache(ttl_seconds=1800)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


def _compose_query(q: str, year: int | None) -> str:
    base = q.strip()
    if not base:
        return ""
    if year:
        return f"{base} {year}".strip()
    return base


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/market/search", response_model=SearchResponse)
async def market_search(
    q: str = Query(..., min_length=2, max_length=120),
    year: int | None = Query(None, ge=1980, le=2035),
) -> SearchResponse:
    query = _compose_query(q, year)
    if not query:
        raise HTTPException(status_code=400, detail="Search query is required.")

    cache_key = query.lower()
    cached = cache.get(cache_key)
    if cached:
        return cached.model_copy(update={"cached": True})

    dubicars_result, dubicars_listings = await search_dubicars(query, year=year)
    dubizzle_result, dubizzle_listings = await search_dubizzle(query)

    listings = dubicars_listings + dubizzle_listings
    listings.sort(key=lambda item: item.price_aed)

    prices = [item.price_aed for item in listings]
    summary_data = summarize_prices(prices)

    response = SearchResponse(
        query=query,
        fetched_at=datetime.now(UTC).isoformat(),
        cached=False,
        summary=PriceSummary(**summary_data),
        sources=[dubicars_result, dubizzle_result],
        listings=listings,
    )
    cache.set(cache_key, response)
    return response


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=True)
