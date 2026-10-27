import React from "react";
import { expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StationVariableList from "./StationVariableList";

it("shows three variables, expands all, and collapses again", () => {
  render(
    <StationVariableList
      names={["Temperature", "Rain", "Snow", "Wind", "Humidity"]}
    />,
  );
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
  expect(screen.queryByText("Humidity")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Show all 5 variables" }));
  expect(screen.getAllByRole("listitem")).toHaveLength(5);
  expect(
    screen.getByRole("button", { name: "Show fewer variables" }),
  ).toHaveAttribute("aria-expanded", "true");
  fireEvent.click(screen.getByRole("button", { name: "Show fewer variables" }));
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
});
