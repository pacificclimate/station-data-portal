import { expect, it } from "vitest";
import { containsAnyText } from "./filterTypes";
import { textFilterTerms } from "@/utils/text-filter-terms";
const rows = ["ST Valley", "Plaza Creek", "Hill Rd", "Cove"].map(
  (name, index) => ({ id: index + 1, values: { name: [name, index + 100] } }),
);
it("matches any text alternative case-insensitively", () => {
  expect(
    containsAnyText(rows, ["name"], [" st ", "PL", "rd"]).map(({ id }) => id),
  ).toEqual([1, 2, 3]);
  expect(containsAnyText(rows, ["name"], "st").map(({ id }) => id)).toEqual([
    1,
  ]);
});
it("does not match the station link's numeric ID as a station name", () => {
  expect(containsAnyText(rows, ["name"], ["100"])).toEqual([]);
});
it("treats punctuation literally and matches scalar native IDs", () => {
  const values = [
    { values: { text: "ST, PL" } },
    { values: { text: "Station Place" } },
    { values: { text: "100%" } },
    { values: { text: 123 } },
    { values: {} },
  ];
  expect(containsAnyText(values, ["text"], ["st, pl"])).toEqual([values[0]]);
  expect(containsAnyText(values, ["text"], ["%"])).toEqual([values[2]]);
  expect(containsAnyText(values, ["text"], ["23"])).toEqual([values[3]]);
});
it("normalizes blanks and duplicate alternatives without splitting punctuation", () => {
  expect(textFilterTerms(["st", " ST ", "", " pl ", "rd, st", null])).toEqual([
    "st",
    "pl",
    "rd, st",
  ]);
  expect(containsAnyText.autoRemove(["", " "])).toBe(true);
  expect(containsAnyText(rows, ["name"], [])).toEqual(rows);
});
