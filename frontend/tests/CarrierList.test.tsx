import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CarrierList from "../src/components/CarrierList";

describe("CarrierList", () => {
  it("renders each carrier with its trucks/day, in the given order", () => {
    render(
      <CarrierList
        carriers={[
          { name: "Knight-Swift Transport Services", trucks_per_day: 10 },
          { name: "YRC Worldwide", trucks_per_day: 5 },
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Knight-Swift Transport Services");
    expect(items[0]).toHaveTextContent("10 trucks/day");
    expect(items[1]).toHaveTextContent("YRC Worldwide");
    expect(items[1]).toHaveTextContent("5 trucks/day");
  });

  it("shows an empty-state message when there are no carriers", () => {
    render(<CarrierList carriers={[]} />);
    expect(screen.getByText(/no carriers found/i)).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
