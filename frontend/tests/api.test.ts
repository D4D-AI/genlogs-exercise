import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchCarriers } from "../src/api";

describe("searchCarriers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("POSTs from_city/to_city to /api/search and returns the carriers array", async () => {
    const carriers = [
      { name: "Knight-Swift Transport Services", trucks_per_day: 10 },
      { name: "YRC Worldwide", trucks_per_day: 5 },
    ];
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ carriers }) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchCarriers("New York", "Washington");

    expect(result).toEqual(carriers);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/search$/);
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(options.body)).toEqual({
      from_city: "New York",
      to_city: "Washington",
    });
  });

  it("throws a readable error on a non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    );
    await expect(searchCarriers("A", "B")).rejects.toThrow(/Search failed \(500\)/);
  });
});
