import { describe, it, expect } from "vitest";
import {
  selectFastestRoutes,
  summarizeRoute,
  formatMiles,
  formatDuration,
} from "../src/selectRoutes";

/** Minimal fake route with a single leg of the given duration (seconds). */
function route(durationSeconds: number): google.maps.DirectionsRoute {
  return {
    legs: [{ duration: { value: durationSeconds } }],
  } as unknown as google.maps.DirectionsRoute;
}

describe("selectFastestRoutes", () => {
  it("returns exactly 3 routes ordered fastest-first when given more than 3", () => {
    const routes = [route(500), route(100), route(400), route(200), route(300)];
    const result = selectFastestRoutes(routes, 3);
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.legs[0].duration!.value)).toEqual([100, 200, 300]);
  });

  it("returns both routes (no padding) ordered fastest-first when given 2", () => {
    const routes = [route(300), route(150)];
    const result = selectFastestRoutes(routes, 3);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.legs[0].duration!.value)).toEqual([150, 300]);
  });

  it("returns the single route when given 1", () => {
    const routes = [route(420)];
    const result = selectFastestRoutes(routes, 3);
    expect(result).toHaveLength(1);
    expect(result[0].legs[0].duration!.value).toBe(420);
  });

  it("does not mutate the input array", () => {
    const routes = [route(500), route(100), route(300)];
    const snapshot = [...routes];
    selectFastestRoutes(routes, 3);
    expect(routes).toEqual(snapshot);
    expect(routes[0].legs[0].duration!.value).toBe(500);
  });
});

describe("formatMiles", () => {
  it("rounds to a whole number at or above 10 miles", () => {
    expect(formatMiles(226 * 1609.344)).toBe("226 mi");
  });
  it("keeps one decimal below 10 miles", () => {
    expect(formatMiles(0.5 * 1609.344)).toBe("0.5 mi");
  });
});

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(13500)).toBe("3 hr 45 min"); // 225 min
  });
  it("omits minutes on a whole hour", () => {
    expect(formatDuration(7200)).toBe("2 hr");
  });
  it("formats minutes only under an hour", () => {
    expect(formatDuration(2700)).toBe("45 min");
  });
});

describe("summarizeRoute", () => {
  it("sums legs and formats distance + duration", () => {
    const multiLeg = {
      legs: [
        { distance: { value: 100000 }, duration: { value: 4000 } },
        { distance: { value: 263711 }, duration: { value: 9500 } },
      ],
    } as unknown as google.maps.DirectionsRoute;

    const summary = summarizeRoute(multiLeg);
    expect(summary.distanceMeters).toBe(363711);
    expect(summary.durationSeconds).toBe(13500);
    expect(summary.distanceText).toBe("226 mi");
    expect(summary.durationText).toBe("3 hr 45 min");
  });
});
