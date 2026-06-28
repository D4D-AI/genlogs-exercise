"""Tests for the carrier search API, covering each spec scenario."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _names_and_counts(carriers):
    return [(c["name"], c["trucks_per_day"]) for c in carriers]


def test_nyc_to_dc():
    resp = client.post(
        "/api/search", json={"from_city": "New York City", "to_city": "Washington DC"}
    )
    assert resp.status_code == 200
    assert _names_and_counts(resp.json()["carriers"]) == [
        ("Knight-Swift Transport Services", 10),
        ("J.B. Hunt Transport Services Inc", 7),
        ("YRC Worldwide", 5),
    ]


def test_sf_to_la():
    resp = client.post(
        "/api/search", json={"from_city": "San Francisco", "to_city": "Los Angeles"}
    )
    assert resp.status_code == 200
    assert _names_and_counts(resp.json()["carriers"]) == [
        ("XPO Logistics", 9),
        ("Schneider", 6),
        ("Landstar Systems", 2),
    ]


def test_default_route():
    resp = client.post(
        "/api/search", json={"from_city": "Chicago", "to_city": "Denver"}
    )
    assert resp.status_code == 200
    assert _names_and_counts(resp.json()["carriers"]) == [
        ("UPS Inc.", 11),
        ("FedEx Corp", 9),
    ]


def test_case_and_whitespace_insensitive():
    resp = client.post(
        "/api/search", json={"from_city": "  new york city ", "to_city": "WASHINGTON DC"}
    )
    assert resp.status_code == 200
    assert _names_and_counts(resp.json()["carriers"]) == [
        ("Knight-Swift Transport Services", 10),
        ("J.B. Hunt Transport Services Inc", 7),
        ("YRC Worldwide", 5),
    ]


def test_google_places_city_name_variants():
    # Google Places autocomplete sends "New York" / "Washington", sometimes as
    # "City, State, USA"; these must still resolve to the NYC->DC route, not the default.
    for from_city, to_city in [
        ("New York", "Washington"),
        ("New York, NY, USA", "Washington, DC, USA"),
    ]:
        resp = client.post(
            "/api/search", json={"from_city": from_city, "to_city": to_city}
        )
        assert resp.status_code == 200
        assert _names_and_counts(resp.json()["carriers"]) == [
            ("Knight-Swift Transport Services", 10),
            ("J.B. Hunt Transport Services Inc", 7),
            ("YRC Worldwide", 5),
        ], f"{from_city} -> {to_city} did not resolve to the NYC->DC route"


def test_carriers_sorted_descending():
    resp = client.post(
        "/api/search", json={"from_city": "Chicago", "to_city": "Denver"}
    )
    counts = [c["trucks_per_day"] for c in resp.json()["carriers"]]
    assert counts == sorted(counts, reverse=True)


def test_missing_field_returns_422():
    resp = client.post("/api/search", json={"from_city": "Boston"})
    assert resp.status_code == 422


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
