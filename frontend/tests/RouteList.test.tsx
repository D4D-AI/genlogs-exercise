import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RouteList from "../src/components/RouteList";
import type { RouteSummary } from "../src/selectRoutes";

const routes: RouteSummary[] = [
  {
    durationText: "3 hr 45 min",
    distanceText: "226 mi",
    durationSeconds: 13500,
    distanceMeters: 363711,
  },
  {
    durationText: "4 hr 2 min",
    distanceText: "240 mi",
    durationSeconds: 14520,
    distanceMeters: 386242,
  },
];

describe("RouteList", () => {
  it("renders each route with time and distance, marking the selected one", () => {
    render(<RouteList routes={routes} selectedRank={0} onSelect={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent("Route 1 (fastest)");
    expect(buttons[0]).toHaveTextContent("3 hr 45 min · 226 mi");
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveTextContent("Route 2");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onSelect with the clicked route's rank", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<RouteList routes={routes} selectedRank={0} onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: /Route 2/ }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("renders nothing when there are no routes", () => {
    const { container } = render(
      <RouteList routes={[]} selectedRank={0} onSelect={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
