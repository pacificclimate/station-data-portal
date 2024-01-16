import { defaultValue } from "./common";

describe("defaultValue", () => {
  const allOptions = [1, 2, 3, 4];

  it('returns the empty array for "none"', () => {
    expect(defaultValue("none", allOptions)).toEqual([]);
  });

  it('returns the full array for "all"', () => {
    expect(defaultValue("all", allOptions)).toEqual(allOptions);
  });

  it("returns a filtered array for a function", () => {
    expect(defaultValue((v) => v < 3, allOptions)).toEqual([1, 2]);
  });

  it("returns the full array for anything else", () => {
    expect(defaultValue(false, allOptions)).toEqual(allOptions);
  });
});
