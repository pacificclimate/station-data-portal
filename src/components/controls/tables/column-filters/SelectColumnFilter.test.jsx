import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import SelectColumnFilter from "./SelectColumnFilter";

const column = (provinces, filterValue, setFilter = vi.fn()) => ({
  id: "Province",
  filterValue,
  setFilter,
  preFilteredRows: provinces.map((Province) => ({ values: { Province } })),
});

it("shows the sole province and disables selection without adding a redundant filter", () => {
  const setFilter = vi.fn();
  render(
    <SelectColumnFilter
      column={column(["BC", "BC"], undefined, setFilter)}
      autoSelectSingle
    />,
  );
  expect(screen.getByRole("combobox")).toHaveValue("BC");
  expect(screen.getByRole("combobox")).toBeDisabled();
  expect(setFilter).not.toHaveBeenCalled();
});

it("enables the dropdown when another province becomes available", () => {
  const setFilter = vi.fn();
  const { rerender } = render(
    <SelectColumnFilter
      column={column(["BC"], undefined, setFilter)}
      autoSelectSingle
    />,
  );
  rerender(
    <SelectColumnFilter
      column={column(["BC", "AB"], undefined, setFilter)}
      autoSelectSingle
    />,
  );
  expect(screen.getByRole("combobox")).toBeEnabled();
  expect(screen.getByRole("combobox")).toHaveValue("*");
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "AB" } });
  expect(setFilter).toHaveBeenCalledWith("AB");
});

it("clears an obsolete province constraint when only a different province remains", () => {
  const setFilter = vi.fn();
  render(
    <SelectColumnFilter
      column={column(["AB"], "BC", setFilter)}
      autoSelectSingle
    />,
  );
  expect(screen.getByRole("combobox")).toHaveValue("AB");
  expect(screen.getByRole("combobox")).toBeDisabled();
  expect(setFilter).toHaveBeenCalledWith(undefined);
});

it("keeps other selectors enabled and handles zero available provinces", () => {
  const { rerender } = render(<SelectColumnFilter column={column(["BC"])} />);
  expect(screen.getByRole("combobox")).toBeEnabled();
  rerender(<SelectColumnFilter column={column([])} autoSelectSingle />);
  expect(screen.getByRole("combobox")).toBeEnabled();
  expect(screen.getByRole("combobox")).toHaveValue("*");
});
