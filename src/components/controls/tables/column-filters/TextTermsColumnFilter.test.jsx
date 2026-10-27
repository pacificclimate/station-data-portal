import React, { useState } from "react";
import { expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import TextTermsColumnFilter from "./TextTermsColumnFilter";

function Harness({ initial }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <TextTermsColumnFilter
        column={{
          Header: "Station Name",
          filterValue: value,
          setFilter: setValue,
        }}
      />
      <output data-testid="value">{JSON.stringify(value) ?? "none"}</output>
      <button onClick={() => setValue(undefined)}>Reset attributes</button>
      <button onClick={() => setValue(["rd", "valley"])}>
        Restore alternatives
      </button>
    </>
  );
}
const input = () =>
  screen.getByRole("textbox", { name: "Station Name contains any" });
const enter = (text) => {
  fireEvent.change(input(), { target: { value: text } });
  fireEvent.keyDown(input(), { key: "Enter" });
};
it("filters live, commits removable alternatives, deduplicates case-insensitively and clears", () => {
  render(<Harness />);
  fireEvent.change(input(), { target: { value: "st" } });
  expect(screen.getByTestId("value")).toHaveTextContent('["st"]');
  fireEvent.keyDown(input(), { key: "Enter" });
  expect(input()).toHaveValue("");
  expect(
    screen.getByRole("button", { name: "Remove st from Station Name" }),
  ).toBeInTheDocument();
  fireEvent.change(input(), { target: { value: "pl" } });
  fireEvent.click(
    screen.getByRole("button", { name: "Add Station Name alternative" }),
  );
  expect(screen.getByTestId("value")).toHaveTextContent('["st","pl"]');
  enter(" PL ");
  expect(screen.getByTestId("value")).toHaveTextContent('["st","pl"]');
  fireEvent.click(
    screen.getByRole("button", { name: "Remove st from Station Name" }),
  );
  expect(screen.getByTestId("value")).toHaveTextContent('["pl"]');
  fireEvent.click(
    screen.getByRole("button", { name: "Clear Station Name filter" }),
  );
  expect(screen.getByTestId("value")).toHaveTextContent("none");
  expect(input()).toHaveValue("");
});
it("keeps commas in a single literal alternative", () => {
  render(<Harness />);
  enter("ST, PL");
  expect(screen.getByTestId("value")).toHaveTextContent('["ST, PL"]');
  expect(
    screen.getByRole("button", { name: "Remove ST, PL from Station Name" }),
  ).toBeInTheDocument();
});
it("reflects external clears and restored arrays even with a draft in progress", () => {
  render(<Harness initial={["st"]} />);
  fireEvent.change(input(), { target: { value: "pl" } });
  fireEvent.click(screen.getByRole("button", { name: "Reset attributes" }));
  expect(input()).toHaveValue("");
  expect(
    screen.queryByRole("button", { name: /Remove .* from Station Name/ }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Restore alternatives" }));
  expect(
    screen.getByRole("button", { name: "Remove rd from Station Name" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Remove valley from Station Name" }),
  ).toBeInTheDocument();
  expect(input()).toHaveValue("");
});
it("preserves legacy strings and lets Escape discard only the current draft", () => {
  render(<Harness initial="st" />);
  expect(input()).toHaveValue("st");
  fireEvent.blur(input());
  expect(
    screen.getByRole("button", { name: "Remove st from Station Name" }),
  ).toBeInTheDocument();
  fireEvent.change(input(), { target: { value: "rd" } });
  fireEvent.keyDown(input(), { key: "Escape" });
  expect(input()).toHaveValue("");
  expect(screen.getByTestId("value")).toHaveTextContent('["st"]');
});
