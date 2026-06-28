import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// The Google Maps SDK is mocked so the search flow runs without a key or network.
vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({ children }: { children: React.ReactNode }) => children,
  Map: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  useMap: () => null,
  useMapsLibrary: () => null,
}));

import App from "../src/App";

async function fillCitiesAndSearch(from: string, to: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("From"), from);
  await user.type(screen.getByLabelText("To"), to);
  await user.click(screen.getByRole("button", { name: /search/i }));
}

describe("App search flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the carriers returned by the API", async () => {
    const carriers = [
      { name: "Knight-Swift Transport Services", trucks_per_day: 10 },
      { name: "J.B. Hunt Transport Services Inc", trucks_per_day: 7 },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ carriers }) }),
    );

    render(<App />);
    await fillCitiesAndSearch("New York", "Washington");

    expect(
      await screen.findByText("Knight-Swift Transport Services"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("J.B. Hunt Transport Services Inc"),
    ).toBeInTheDocument();
  });

  it("shows a loading indicator while the search is in flight", async () => {
    let resolveFetch!: (value: unknown) => void;
    const pending = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending));

    render(<App />);
    await fillCitiesAndSearch("A", "B");

    expect(screen.getByText(/loading carriers/i)).toBeInTheDocument();

    resolveFetch({ ok: true, json: async () => ({ carriers: [] }) });
    await waitFor(() =>
      expect(screen.queryByText(/loading carriers/i)).not.toBeInTheDocument(),
    );
  });

  it("shows an error message when the API call fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    );

    render(<App />);
    await fillCitiesAndSearch("A", "B");

    expect(await screen.findByRole("alert")).toHaveTextContent(/search failed/i);
  });
});
