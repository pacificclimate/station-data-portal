import reduce from "lodash/fp/reduce";
import assign from "lodash/fp/assign";
import map from "lodash/fp/map";
import forEach from "lodash/fp/forEach";
import mapValues from "lodash/fp/mapValues";
import toPairs from "lodash/fp/toPairs";
import flow from "lodash/fp/flow";
import curry from "lodash/fp/curry";
import groupBy from "lodash/fp/groupBy";
import isArray from "lodash/fp/isArray";
import isObject from "lodash/fp/isObject";
import union from "lodash/fp/union";

// TODO: There is a better fp way to do this. Find it and do it.
export const composeWithRestArgs = curry(
  (f, g) =>
    (first, ...rest) =>
      f(g(first, ...rest), ...rest),
);

export const forEachWithKey = forEach.convert({ cap: false });

// Group a list by accumulating all items that match on `by` into a single
// list item containing the `by` value. The result is a list of objects
// of the following shape:
//
//    {
//      by: <any>,
//      items: [ <any> ]
//    }
//
//  Implementation note: The use of JSON encoding to manage the group keys
//  (and, not coincidentally, to pass the bulk of the work off to `groupBy`)
//  is unsound and potentially inefficient, but very, very convenient. Shame.
//  Sounder to use a WeakMap to accumulate the groups.
// TODO: Remove unnecessary arg `list` and just return the function
export const groupByGeneral = curry((by, list) =>
  flow(
    groupBy((item) => JSON.stringify(by(item))),
    toPairs,
    map((pair) => ({ by: JSON.parse(pair[0]), items: pair[1] })),
  )(list),
);

// Deeply map a function over an item; deeply in the sense of recursively
// if the item is an array or object:
// If `item` is an array, apply `mapDeep(iteratee)` to its items using `map`.
// If `item` is an object, apply `mapDeep(iteratee)` to its items using `mapValues`.
// Otherwise `item` is not a collection, so just apply `iteratee` to it.
export const mapDeep = curry((iteratee, item) => {
  if (isArray(item)) {
    return map(mapDeep(iteratee), item);
  }
  if (isObject(item)) {
    return mapValues(mapDeep(iteratee), item);
  }
  return iteratee(item);
});

export const mapWithKey = map.convert({ cap: false });

// Return the "union" of a list of objects. "Union" here means assigning all
// properties of the objects to a single, initially empty, result object.
// If a property occurs in more than one object in the list, the last
// occurrence wins (as in `assign`).
export const objUnion = reduce((result, value) => assign(result, value), {});

// Return the _.union of all arrays in the (array) argument.
export const unionAll = reduce(union, []);
