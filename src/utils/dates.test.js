import { describe, test, it, expect } from "vitest";
import { utcDateOnly } from "./dates";

describe("utcDateOnly", () => {
  test.each([
    ["2000-12-31T23:59:59", "2000-12-31T00:00:00.000Z"],
    ["2000-12-31T23:59:59.123", "2000-12-31T00:00:00.000Z"],
    ["2000-12-31T23:59", "2000-12-31T00:00:00.000Z"],
    ["2001-01-01", "2001-01-01T00:00:00.000Z"],
    ["2000-12-31T23:59:59Z", "2000-12-31T00:00:00.000Z"],
    ["2000-12-31T23:59:59-08:00", "2001-01-01T00:00:00.000Z"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(utcDateOnly(input).toISOString()).toBe(expected);
  });

  it("copies Date objects without modifying the original", () => {
    const input = new Date("2000-12-31T23:59:59Z");
    expect(utcDateOnly(input).toISOString()).toBe("2000-12-31T00:00:00.000Z");
    expect(input.toISOString()).toBe("2000-12-31T23:59:59.000Z");
  });

  test.each([null, undefined])("preserves an absent date: %s", (input) => {
    expect(utcDateOnly(input)).toBe(input);
  });
});
