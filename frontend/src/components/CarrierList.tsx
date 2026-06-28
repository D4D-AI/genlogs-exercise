import type { Carrier } from "../api";

/** Render carriers in the order the API returned them (already sorted by trucks/day). */
export default function CarrierList({ carriers }: { carriers: Carrier[] }) {
  if (carriers.length === 0) {
    return <p className="hint">No carriers found for this route.</p>;
  }
  return (
    <ol className="carrier-list">
      {carriers.map((carrier, i) => (
        <li key={`${carrier.name}-${i}`}>
          <span className="carrier-name">{carrier.name}</span>
          <span className="carrier-trucks">{carrier.trucks_per_day} trucks/day</span>
        </li>
      ))}
    </ol>
  );
}
