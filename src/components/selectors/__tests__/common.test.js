import { defaultValue } from "../common";

describe("defaultValue", () => {
  const allOptions = [1, 2, 3, 4];

  test.concurrent.each`
    input           | expected      | comment
    ${"none"}       | ${[]}         | ${"empty array for 'none'"}
    ${"all"}        | ${allOptions} | ${"full array for 'all'"}
    ${(v) => v < 3} | ${[1, 2]}     | ${"filtered array for a function"}
    ${false}        | ${allOptions} | ${"full array for anything else"}
    ${"sdfsdfsdf"}  | ${allOptions} | ${"full array for anything else"}
  `("returns $expected for $input", ({ input, expected }) => {
    expect(defaultValue(input, allOptions)).toEqual(expected);
  });
});
