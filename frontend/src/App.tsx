import { useState } from "react";
import type { FormEvent } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import CityAutocomplete from "./components/CityAutocomplete";
import CarrierList from "./components/CarrierList";
import RouteMap from "./components/RouteMap";
import { searchCarriers } from "./api";
import type { Carrier } from "./api";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function App() {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [carriers, setCarriers] = useState<Carrier[] | null>(null);
  const [route, setRoute] = useState<{ from: string; to: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSearch = fromCity.trim() !== "" && toCity.trim() !== "" && !loading;

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (!canSearch) return;
    setLoading(true);
    setError(null);
    try {
      const result = await searchCarriers(fromCity, toCity);
      setCarriers(result);
      setRoute({ from: fromCity, to: toCity });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed. Please try again.");
      setCarriers(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <APIProvider apiKey={MAPS_KEY ?? ""} libraries={["places", "routes"]}>
      <div className="app">
        <header>
          <h1>Genlogs Carrier Portal</h1>
          <p>Find which carriers move the most trucks between two cities.</p>
        </header>

        {!MAPS_KEY && (
          <div className="banner" role="status">
            Set <code>VITE_GOOGLE_MAPS_API_KEY</code> to enable city autocomplete and the map.
          </div>
        )}

        <form className="search" onSubmit={handleSearch}>
          <CityAutocomplete
            id="from"
            label="From"
            value={fromCity}
            placeholder="Origin city"
            onChange={setFromCity}
          />
          <CityAutocomplete
            id="to"
            label="To"
            value={toCity}
            placeholder="Destination city"
            onChange={setToCity}
          />
          <button type="submit" disabled={!canSearch}>
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        <div className="results">
          <section className="carriers" aria-label="Carriers">
            <h2>Carriers</h2>
            {loading && <p className="hint">Loading carriers…</p>}
            {!loading && carriers && <CarrierList carriers={carriers} />}
            {!loading && !carriers && !error && (
              <p className="hint">Enter two cities and click Search.</p>
            )}
          </section>
          <section className="map" aria-label="Route map">
            <h2>Routes</h2>
            {route ? (
              <RouteMap from={route.from} to={route.to} />
            ) : (
              <div className="map-placeholder">
                The route map appears here after a search.
              </div>
            )}
          </section>
        </div>
      </div>
    </APIProvider>
  );
}
