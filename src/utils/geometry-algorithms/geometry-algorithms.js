// Geometry algorithms
//
// Adapted from http://geomalgorithms.com/
// Copyright 2000 softSurfer, 2012 Dan Sunday
//
// This code extends the geomalgorithms code consistently in the following ways:
//
//  - Every function is parametrized with accessor functions `getX` and `getY`
//    for extracting x and y coordinates, respectively, from point objects.
//    This enables these functions to be used easily in a variety of contexts,
//    e.g., when x and y are lon and lat respectively.
//
//  - Every function is curried, which makes it simple to bind the accessor
//    functions, and more generally to use in an FP style, which we favour.
//    To that end, functions are defined with args in order of increasing
//    likely variability. This order is always accessor functions first.
//    In the case of `isPointinPolygonWn`, the polygon arg comes before the
//    point arg, because it is likely that many points may be tested against
//    a single polygon. It's subjective, but you get the idea.

import { curry, concat, isEqual } from "lodash/fp";

// isLeft(): tests if a point is Left|On|Right of an infinite line.
//    Input:  three points P0, P1, and P2
//    Return: >0 for P2 left of the line through P0 and P1
//            =0 for P2  on the line
//            <0 for P2  right of the line
//    See: Algorithm 1 "Area of Triangles and Polygons"
//
// Testing has revealed that this desccription is incomplete:
// The description is correct for an upward line, but signs are reversed
// for a downward line.

/* Original code in C++

inline int
isLeft( Point P0, Point P1, Point P2 )
{
    return ( (P1.x - P0.x) * (P2.y - P0.y)
            - (P2.x -  P0.x) * (P1.y - P0.y) );
}
*/

export const isLeft = curry(
  (
    getX,
    getY, // Point coordinate accessor functions
    P0, // Origin point for line
    P1, // Terminus point for line
    P2, // Point to be tested
  ) => {
    return (
      (getX(P1) - getX(P0)) * (getY(P2) - getY(P0)) -
      (getX(P2) - getX(P0)) * (getY(P1) - getY(P0))
    );
  },
);

// isPointInPolygonWn(): winding number test for a point in a polygon
//      Input:  getX, getY = accessor functions to extract x and y coords from
//                input vertices/points
//              polygon = an array of vertices defining the polygon
//              point = the point to be tested
//      Return:  wn = the winding number (=0 only when P is outside)

/*  Original code in C++
int
wn_PnPoly( Point P, Point* V, int n )
{
    int    wn = 0;    // the  winding number counter

    // loop through all edges of the polygon
    for (int i=0; i<n; i++) {   // edge from V[i] to  V[i+1]
        if (V[i].y <= P.y) {          // start y <= P.y
            if (V[i+1].y  > P.y)      // an upward crossing
                 if (isLeft( V[i], V[i+1], P) > 0)  // P left of  edge
                     ++wn;            // have  a valid up intersect
        }
        else {                        // start y > P.y (no test needed)
            if (V[i+1].y  <= P.y)     // a downward crossing
                 if (isLeft( V[i], V[i+1], P) < 0)  // P right of  edge
                     --wn;            // have  a valid down intersect
        }
    }
    return wn;
}
*/

export const isPointInPolygonWn = curry(
  (
    getX,
    getY, // Point coordinate accessor functions
    polygon, // Polygon: array of vertices (points);
    //  can be in closed or open style
    point, // Point to be tested
  ) => {
    // Ensure a vertex list with V[0] = V[n]
    const V = isEqual(polygon[0], polygon[polygon.length - 1])
      ? polygon
      : concat(polygon, polygon[0]);
    const n = V.length - 1;

    // console.log('isPointInPolygonWn:', 'poly =', polygon);
    // console.log('isPointInPolygonWn:', 'isEqual =', isEqual(polygon[0], polygon[polygon.length-1]));

    // console.log('isPointInPolygonWn:', 'V =', V);
    // console.log('isPointInPolygonWn:', 'n =', n);

    // console.log('isPointInPolygonWn:', 'point =', point);

    let wn = 0;

    const Py = getY(point);

    for (let i = 0; i < n; i++) {
      // edge from V[i] to  V[i+1]
      // console.log('i =', i);
      if (getY(V[i]) <= Py) {
        // start y <= getY(point)
        // console.log('// start y <= getY(point)');
        if (getY(V[i + 1]) > Py) {
          // an upward crossing
          // console.log('// an upward crossing');
          if (isLeft(getX, getY, V[i], V[i + 1], point) > 0) {
            // point left of  edge
            // console.log('// point left of  edge');
            wn += 1;
            // have  a valid up intersect
          }
        }
      } else {
        // start y > getY(point) (no test needed)
        // console.log('// start y > getY(point) (no test needed)');
        if (getY(V[i + 1]) <= Py) {
          // a downward crossing
          // console.log('// a downward crossing');
          if (isLeft(getX, getY, V[i], V[i + 1], point) < 0) {
            // point right of  edge
            // console.log('// point right of  edge');
            wn -= 1;
            // have  a valid down intersect
          }
        }
      }
    }

    return wn;
  },
);
