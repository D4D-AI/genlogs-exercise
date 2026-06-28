"""In-memory carrier dataset and lookup.

City matching is case-insensitive and trims surrounding whitespace. Carriers are always
returned sorted by trucks/day, descending. See openspec/project.md for the source of truth.
"""

from __future__ import annotations

# Each route maps a (from, to) pair to its carriers as (name, trucks_per_day).
# Keys are stored normalized (trim + lowercase) so lookups can normalize the request the
# same way.
_KNOWN_ROUTES: dict[tuple[str, str], list[tuple[str, int]]] = {
    ("new york city", "washington dc"): [
        ("Knight-Swift Transport Services", 10),
        ("J.B. Hunt Transport Services Inc", 7),
        ("YRC Worldwide", 5),
    ],
    ("san francisco", "los angeles"): [
        ("XPO Logistics", 9),
        ("Schneider", 6),
        ("Landstar Systems", 2),
    ],
}

# Returned for any city pair that is not one of the known routes.
_DEFAULT_ROUTE: list[tuple[str, int]] = [
    ("UPS Inc.", 11),
    ("FedEx Corp", 9),
]

# Google Places autocomplete labels the dataset cities differently than the canonical keys
# (e.g. "New York" / "Washington" instead of "New York City" / "Washington DC"). Map those
# common variants onto the canonical keys so the known routes are reachable from the UI.
_CITY_ALIASES: dict[str, str] = {
    "new york": "new york city",
    "nyc": "new york city",
    "washington": "washington dc",
    "washington d.c.": "washington dc",
}


def _normalize(city: str) -> str:
    # Reduce "New York, NY, USA" to its first component, then trim/lowercase and resolve
    # known aliases to the dataset's canonical city name.
    key = city.split(",")[0].strip().lower()
    return _CITY_ALIASES.get(key, key)


def lookup_carriers(from_city: str, to_city: str) -> list[dict[str, object]]:
    """Return the carriers for a route, sorted by trucks/day descending.

    Falls back to the default carriers for any pair that is not a known route.
    """
    key = (_normalize(from_city), _normalize(to_city))
    carriers = _KNOWN_ROUTES.get(key, _DEFAULT_ROUTE)
    ordered = sorted(carriers, key=lambda c: c[1], reverse=True)
    return [{"name": name, "trucks_per_day": trucks} for name, trucks in ordered]
