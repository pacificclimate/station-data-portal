import each from "jest-each";
import { isLeft, isPointInPolygonWn } from "../geometry-algorithms";

// Helpers

const Point = (x, y) => ({ x, y });
const getX = (p) => p.x;
const getY = (p) => p.y;

const reverse = (a) => a.slice().reverse();

// Tests

describe("isLeft", () => {
  // Bind coordinate accessors for point objects.
  const isLeftXY = isLeft(getX, getY);

  const p0 = Point(0, 0);
  const p1 = Point(1, 1);

  // Note: `isLeft` switches sign depending on whether the line is upwaard or
  // downward. This complicates the tests a bit.
  each([
    ["with upward line", p0, p1, true],
    ["with downward line", p1, p0, false],
  ]).describe("%s", (desc, p0, p1, upward) => {
    each([
      [
        "left of line",
        Point(-1, 1),
        upward ? "toBeGreaterThan" : "toBeLessThan",
      ],
      [
        "right of line",
        Point(2, 1),
        upward ? "toBeLessThan" : "toBeGreaterThan",
      ],
      ["on line", Point(0.5, 0.5), "toEqual"],
    ]).test("for point %s", (desc, p2, matcher) => {
      const expecter = expect(isLeftXY(p0, p1, p2));
      expecter[matcher](0);
    });
  });
});

describe("isPointInPolygonWn", () => {
  // Bind coordinate accessors for point objects.
  const isPointInPolygonWnXY = isPointInPolygonWn(getX, getY);

  // Test polygons always include origin, i.e., (0,0),
  // and exclude points at distance greater than 5.
  // Test polygons are defined in counterclockwise vertex order.
  // This makes the winding number > 0 for points inside the polygon.
  // Except for `triangleClosed`, all polygons are defined in the open
  // format (initial point NOT repeated at end of vertex list).
  const triangleClosed = [
    Point(-1, -1),
    Point(1, -1),
    Point(0, 1),
    Point(-1, -1),
  ];
  const triangleOpen = [
    Point(-1, -1),
    Point(1, -1),
    Point(0, 1),
    Point(-1, -1),
  ];
  const rectangle = [Point(-2, -1), Point(2, -1), Point(2, 1), Point(-2, 1)];
  const convexQuadrilateral = [
    Point(-2, -1),
    Point(2, -1),
    Point(1, 0),
    Point(0, 2),
  ];
  const bigConvexPolygon = [
    Point(-3, -3),
    Point(-2, -2),
    Point(-1, -3),
    Point(1, -1),
    Point(2, -3),
    Point(3, -1),
    Point(3, 1),
    Point(2, 2),
    Point(3, 3),
    Point(0, 2),
    Point(-1, 3),
    Point(-2, 1),
    Point(-3, 1),
    Point(-2, -1),
  ];

  each([
    ["a triangle with closed definition", triangleClosed],
    ["a triangle with open definition", triangleOpen],
    ["a triangle, CW", reverse(triangleOpen), true],
    ["a rectangle", rectangle],
    ["a rectangle, CW", reverse(rectangle), true],
    ["a convex quadrilateral", convexQuadrilateral],
    ["a big convex polygon", bigConvexPolygon],
  ]).describe("when polygon is %s", (descr, polygon, cw) => {
    each([
      ["inside", Point(0, 0), cw ? "toBeLessThan" : "toBeGreaterThan"],
      ["outside", Point(5, 0), "toEqual"],
    ]).test("for point %s polygon", (descr, point, matcher) => {
      expect(isPointInPolygonWnXY(polygon, point))[matcher](0);
    });
  });
});
