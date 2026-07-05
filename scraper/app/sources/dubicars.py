import html
import json
import re
from urllib.parse import urlencode

import httpx

from ..models import Listing, SourceResult

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)

SUGGESTIONS_URL = "https://api-suggestions.dubicars.com/suggestions"
ITEM_PATTERN = re.compile(
    r'<li class="serp-list-item[^"]*"[^>]*data-sp-item=\'([^\']+)\'[^>]*>(.*?)</li>',
    re.S,
)


def _title_from_block(block: str) -> str | None:
    alt = re.search(r'<img[^>]+alt="([^"]+)"', block)
    if alt:
        return html.unescape(alt.group(1)).strip()
    href = re.search(r'href="https://www\.dubicars\.com/([^"]+\.html)"', block)
    if href:
        slug = href.group(1).replace(".html", "").split("-")
        return " ".join(part for part in slug if not part.isdigit()).title()
    return None


def _url_from_block(block: str) -> str | None:
    href = re.search(r'href="(https://www\.dubicars\.com/[^"]+\.html)"', block)
    if href:
        return href.group(1)
    rel = re.search(r'href="(/[^"]+\.html)"', block)
    if rel:
        return f"https://www.dubicars.com{rel.group(1)}"
    return None


async def _resolve_suggestion(client: httpx.AsyncClient, query: str) -> dict | None:
    response = await client.get(
        SUGGESTIONS_URL,
        params={"q": query},
        headers={"User-Agent": USER_AGENT},
    )
    response.raise_for_status()
    suggestions = response.json()
    if not suggestions:
        return None

    query_lower = query.lower()
    for item in suggestions:
        if item.get("name", "").lower() == query_lower:
            return item

    for item in suggestions:
        name = item.get("name", "").lower()
        if query_lower in name or name in query_lower:
            return item

    return suggestions[0]


def build_search_url(query: str, filters: dict | None = None, year: int | None = None) -> str:
    params: dict[str, str] = {"c": "new-and-used"}

    if filters:
        make_id = filters.get("ma")
        model_id = filters.get("mo")
        if make_id:
            params["ma"] = str(make_id)
        if model_id:
            params["mo"] = str(model_id)
    else:
        params["keyword"] = query

    if year:
        params["yf"] = str(year)
        params["yt"] = str(year)

    return f"https://www.dubicars.com/search?{urlencode(params)}"


def parse_dubicars_html(page_html: str) -> list[Listing]:
    listings: list[Listing] = []
    seen_urls: set[str] = set()

    for match in ITEM_PATTERN.finditer(page_html):
        try:
            meta = json.loads(html.unescape(match.group(1)))
        except json.JSONDecodeError:
            continue

        price = meta.get("pr")
        if not isinstance(price, int) or price <= 0:
            continue

        block = match.group(2)
        url = _url_from_block(block)
        if not url or url in seen_urls:
            continue
        seen_urls.add(url)

        title = _title_from_block(block) or "Vehicle listing"
        year = meta.get("y")
        km = meta.get("km")
        is_new = meta.get("new")
        condition = "New" if is_new else "Used"
        seller_type = meta.get("st")
        seller = seller_type.title() if isinstance(seller_type, str) else None

        listings.append(
            Listing(
                source="dubicars",
                title=title,
                price_aed=price,
                year=year if isinstance(year, int) else None,
                km=km if isinstance(km, int) else None,
                condition=condition,
                seller=seller,
                url=url,
            )
        )

    return listings


async def search_dubicars(
    query: str,
    limit: int = 30,
    year: int | None = None,
) -> tuple[SourceResult, list[Listing]]:
    headers = {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml",
    }

    suggestion = None
    search_url = build_search_url(query, year=year)

    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            suggestion = await _resolve_suggestion(client, query)
            filters = suggestion.get("filters") if suggestion else None
            search_url = build_search_url(query, filters=filters, year=year)

            response = await client.get(search_url, headers=headers)
            response.raise_for_status()
            page_html = response.text
    except httpx.HTTPError as exc:
        return (
            SourceResult(
                id="dubicars",
                name="Dubicars",
                status="error",
                message=str(exc),
                search_url=search_url,
            ),
            [],
        )

    if "serp-list-item" not in page_html:
        return (
            SourceResult(
                id="dubicars",
                name="Dubicars",
                status="empty",
                message="No listings found for this search.",
                search_url=search_url,
            ),
            [],
        )

    listings = parse_dubicars_html(page_html)[:limit]
    status = "ok" if listings else "empty"
    message = None if listings else "No parseable listings on the results page."

    if suggestion and listings:
        message = f"Matched model: {suggestion.get('name')}"

    return (
        SourceResult(
            id="dubicars",
            name="Dubicars",
            status=status,
            count=len(listings),
            message=message,
            search_url=search_url,
        ),
        listings,
    )
