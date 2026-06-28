/** Total driving time of a route, in seconds (sum of its legs' durations). */
function routeDurationSeconds(route: google.maps.DirectionsRoute): number {
  const legs = route.legs ?? [];
  return legs.reduce((sum, leg) => sum + (leg?.duration?.value ?? 0), 0);
}

/** Total driving distance of a route, in meters (sum of its legs' distances). */
function routeDistanceMeters(route: google.maps.DirectionsRoute): number {
  const legs = route.legs ?? [];
  return legs.reduce((sum, leg) => sum + (leg?.distance?.value ?? 0), 0);
}

const METERS_PER_MILE = 1609.344;

/** Format meters as miles: "226 mi" (whole at >=10 mi, one decimal below). */
export function formatMiles(meters: number): string {
  const miles = meters / METERS_PER_MILE;
  const rounded = miles >= 10 ? Math.round(miles) : Math.round(miles * 10) / 10;
  return `${rounded} mi`;
}

/** Format seconds as a compact driving time: "3 hr 45 min", "45 min". */
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

export interface RouteSummary {
  distanceText: string;
  durationText: string;
  distanceMeters: number;
  durationSeconds: number;
}

/** Distance + travel-time summary for a single route, with display strings. */
export function summarizeRoute(route: google.maps.DirectionsRoute): RouteSummary {
  const distanceMeters = routeDistanceMeters(route);
  const durationSeconds = routeDurationSeconds(route);
  return {
    distanceMeters,
    durationSeconds,
    distanceText: formatMiles(distanceMeters),
    durationText: formatDuration(durationSeconds),
  };
}

/**
 * Returns the `max` fastest routes (shortest total travel time), ordered fastest first.
 * Does not mutate the input; returns the original route objects so callers can recover each
 * route's original index via `result.routes.indexOf(route)` for DirectionsRenderer.
 */
export function selectFastestRoutes(
  routes: google.maps.DirectionsRoute[],
  max = 3,
): google.maps.DirectionsRoute[] {
  return [...routes]
    .sort((a, b) => routeDurationSeconds(a) - routeDurationSeconds(b))
    .slice(0, max);
}
