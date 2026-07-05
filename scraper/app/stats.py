from statistics import median


def summarize_prices(prices: list[int]) -> dict[str, int | None]:
    if not prices:
        return {"count": 0, "min_aed": None, "max_aed": None, "median_aed": None}
    return {
        "count": len(prices),
        "min_aed": min(prices),
        "max_aed": max(prices),
        "median_aed": int(median(prices)),
    }
