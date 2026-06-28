import { useCallback, useEffect, useState } from "react";
import { Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { selectFastestRoutes, summarizeRoute } from "../selectRoutes";
import type { RouteSummary } from "../selectRoutes";
import RouteList from "./RouteList";

interface Props {
  from: string;
  to: string;
}

/** Map region: an embedded Google Map plus a selectable list of the fastest routes. */
export default function RouteMap({ from, to }: Props) {
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routes, setRoutes] = useState<RouteSummary[]>([]);
  const [selectedRank, setSelectedRank] = useState(0);

  const handleRoutes = useCallback((next: RouteSummary[]) => {
    setRoutes(next);
    setSelectedRank(0);
  }, []);

  return (
    <>
      <div className="map-wrapper">
        <Map
          defaultCenter={{ lat: 39.5, lng: -98.35 }}
          defaultZoom={4}
          gestureHandling="greedy"
          style={{ width: "100%", height: "100%" }}
        >
          <Directions
            from={from}
            to={to}
            selectedRank={selectedRank}
            onError={setRouteError}
            onRoutes={handleRoutes}
          />
        </Map>
        {routeError && <div className="map-error">{routeError}</div>}
      </div>
      <RouteList
        routes={routes}
        selectedRank={selectedRank}
        onSelect={setSelectedRank}
      />
    </>
  );
}

interface DirectionsProps extends Props {
  selectedRank: number;
  onError: (message: string | null) => void;
  onRoutes: (routes: RouteSummary[]) => void;
}

/**
 * Requests driving directions with alternatives and renders the 3 fastest routes (by total
 * travel time), fastest first. The selected route is emphasized; selecting a different route
 * only restyles the existing result — it makes no new Directions request.
 */
function Directions({ from, to, selectedRank, onError, onRoutes }: DirectionsProps) {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const [result, setResult] = useState<google.maps.DirectionsResult | null>(null);
  // Indices into result.routes, ordered fastest first (rank -> routeIndex).
  const [orderedIndices, setOrderedIndices] = useState<number[]>([]);

  // Fetch directions when the searched cities change (one API call per search).
  useEffect(() => {
    if (!routesLib || !map || !from || !to) return;
    const service = new routesLib.DirectionsService();
    let active = true;

    service.route(
      {
        origin: from,
        destination: to,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      },
      (res, status) => {
        if (!active) return;
        if (status !== google.maps.DirectionsStatus.OK || !res) {
          onError("Could not find driving routes between these cities.");
          setResult(null);
          setOrderedIndices([]);
          onRoutes([]);
          return;
        }
        onError(null);
        const fastest = selectFastestRoutes(res.routes, 3);
        setResult(res);
        setOrderedIndices(fastest.map((route) => res.routes.indexOf(route)));
        onRoutes(fastest.map((route) => summarizeRoute(route)));
      },
    );

    return () => {
      active = false;
    };
  }, [routesLib, map, from, to, onError, onRoutes]);

  // Draw the routes and restyle on selection — no refetch, no extra API call.
  useEffect(() => {
    if (!routesLib || !map || !result || orderedIndices.length === 0) return;
    const renderers = orderedIndices.map((routeIndex, rank) => {
      const selected = rank === selectedRank;
      return new routesLib.DirectionsRenderer({
        map,
        directions: result,
        routeIndex,
        preserveViewport: true,
        // Only the selected route shows the A/B markers; the others are lines only.
        suppressMarkers: !selected,
        polylineOptions: {
          strokeColor: selected ? "#1a73e8" : "#9aa0a6",
          strokeWeight: selected ? 6 : 4,
          strokeOpacity: selected ? 0.9 : 0.5,
          zIndex: selected ? 2 : 1,
        },
      });
    });
    return () => renderers.forEach((r) => r.setMap(null));
  }, [routesLib, map, result, orderedIndices, selectedRank]);

  // Fit the map to the rendered routes once per result (not on selection changes).
  useEffect(() => {
    if (!map || !result || orderedIndices.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    orderedIndices.forEach((i) => {
      const routeBounds = result.routes[i]?.bounds;
      if (routeBounds) bounds.union(routeBounds);
    });
    if (!bounds.isEmpty()) map.fitBounds(bounds, 48);
  }, [map, result, orderedIndices]);

  return null;
}
