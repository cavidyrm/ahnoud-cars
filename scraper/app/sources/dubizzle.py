import html
import re
from urllib.parse import quote_plus

import httpx

from ..models import Listing, SourceResult

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)

BLOCKED_MARKERS = ("Incapsula", "cf-chl", "Just a moment", "Request unsuccessful")


def build_search_url(query: str) -> str:
    return f"https://uae.dubizzle.com/motors/used-cars/?keyword={quote_plus(query)}"


def _parse_price(text: str) -> int | None:
    match = re.search(r"([\d,]+)", text.replace("AED", ""))
    if not match:
        return None
    try:
        return int(match.group(1).replace(",", ""))
    except ValueError:
        return None


def parse_dubizzle_html(page_html: str) -> list[Listing]:
    listings: list[Listing] = []
    seen: set[str] = set()

    # Dubizzle markup changes; match listing anchors with nearby AED amounts.
    for block in re.findall(
        r'<article[^>]*>.*?</article>|<li[^>]*data-testid[^>]*>.*?</li>',
        page_html,
        re.S | re.I,
    ):
        link = re.search(r'href="(https://uae\.dubizzle\.com/[^"]+/motors/used-cars/[^"]+)"', block)
        if not link:
            continue
        url = html.unescape(link.group(1))
        if url in seen:
            continue

        title_match = re.search(r'aria-label="([^"]+)"|alt="([^"]+)"|<h[23][^>]*>([^<]+)', block)
        title = None
        if title_match:
            title = next(g for g in title_match.groups() if g)
        title = html.unescape(title or "Vehicle listing").strip()

        price_match = re.search(r"AED\s*([\d,]+)", block)
        if not price_match:
            continue
        price = _parse_price(price_match.group(0))
        if not price:
            continue

        year_match = re.search(r"\b(19|20)\d{2}\b", block)
        km_match = re.search(r"([\d,]+)\s*km", block, re.I)

        seen.add(url)
        listings.append(
            Listing(
                source="dubizzle",
                title=title,
                price_aed=price,
                year=int(year_match.group(0)) if year_match else None,
                km=int(km_match.group(1).replace(",", "")) if km_match else None,
                condition="Used",
                seller=None,
                url=url,
            )
        )

    return listings


async def search_dubizzle(query: str, limit: int = 20) -> tuple[SourceResult, list[Listing]]:
    search_url = build_search_url(query)
    headers = {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml",
        "Referer": "https://uae.dubizzle.com/",
    }

    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            response = await client.get(search_url, headers=headers)
            response.raise_for_status()
            page_html = response.text
    except httpx.HTTPError as exc:
        return (
            SourceResult(
                id="dubizzle",
                name="Dubizzle Motors",
                status="error",
                message=str(exc),
                search_url=search_url,
            ),
            [],
        )

    if any(marker in page_html for marker in BLOCKED_MARKERS):
        return (
            SourceResult(
                id="dubizzle",
                name="Dubizzle Motors",
                status="blocked",
                message="Site blocked automated access from this server. Dubicars results are still shown.",
                search_url=search_url,
            ),
            [],
        )

    listings = parse_dubizzle_html(page_html)[:limit]
    status = "ok" if listings else "empty"
    message = None if listings else "No listings parsed — open Dubizzle manually via the link."

    return (
        SourceResult(
            id="dubizzle",
            name="Dubizzle Motors",
            status=status,
            count=len(listings),
            message=message,
            search_url=search_url,
        ),
        listings,
    )
