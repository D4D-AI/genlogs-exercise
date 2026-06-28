export interface Carrier {
  name: string;
  trucks_per_day: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/** POST the chosen cities to the backend and return the carrier list it responds with. */
export async function searchCarriers(
  fromCity: string,
  toCity: string,
): Promise<Carrier[]> {
  const resp = await fetch(`${API_BASE_URL}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from_city: fromCity, to_city: toCity }),
  });
  if (!resp.ok) {
    throw new Error(`Search failed (${resp.status}). Please try again.`);
  }
  const data = (await resp.json()) as { carriers: Carrier[] };
  return data.carriers;
}
