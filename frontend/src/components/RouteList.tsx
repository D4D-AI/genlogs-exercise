import type { RouteSummary } from "../selectRoutes";

interface Props {
  routes: RouteSummary[];
  selectedRank: number;
  onSelect: (rank: number) => void;
}

/** Clickable list of the rendered routes; selecting one highlights it on the map. */
export default function RouteList({ routes, selectedRank, onSelect }: Props) {
  if (routes.length === 0) return null;
  return (
    <ul className="route-list">
      {routes.map((route, rank) => {
        const selected = rank === selectedRank;
        return (
          <li key={rank}>
            <button
              type="button"
              className={`route-item${selected ? " selected" : ""}`}
              aria-pressed={selected}
              onClick={() => onSelect(rank)}
            >
              <span className="route-swatch" aria-hidden="true" />
              <span className="route-label">
                Route {rank + 1}
                {rank === 0 ? " (fastest)" : ""}
              </span>
              <span className="route-meta">
                {route.durationText} · {route.distanceText}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
