// This module provides functions for filtering (metadata) from the data
// services.

import flow from 'lodash/fp/flow';
import split from 'lodash/fp/split';
import map from 'lodash/fp/map';
import compact from 'lodash/fp/compact';
import every from 'lodash/fp/every';
import get from 'lodash/fp/get';

// Station filtering: This is done (at the moment) client-side.
//
// Station filters are specified with the environment variable
// `REACT_APP_STATION_FILTERS`, which contains zero or more semicolon-separated
// station filter expressions. A station filter expression takes the form
// `<path> <op> <value>`, where
// <path> is a JS path addressing a property in a station object,
// <op> is a comparison operator (only = supported at the moment),
// <value> is any string not containing a semicolon.
//
// A more flexible (but less safe) alternative would be to allow any filter
// expression to be any valid JS expression, and to evaluate it in the context
// of `station` using `Function`.

const filterExpressionPattern = /(?<path>[^=]*)(?<op>=)(?<value>.*)/;

// Converts a string to an array of parsed station filter expressions.
// Any invalid expressions are flagged on the console and otherwise ignored.
// A parsed filter expression is an object with keys 'path`, 'op', 'value'.
export const stationFilterExpressionsParser = flow(
  split(';'),
  compact,
  map(s => [s, s.match(filterExpressionPattern)]),
  map(([s, match]) => {
    if (!match) {
      console.warn(`Warning: '${s}' is not a valid station filter expression`)
    }
    return match;
  }),
  compact,
  map(match => match.groups),
);

// Given an array of parsed filter expressions, returns a predicate that
// evaluates the conjunction of the expressions for a given station.
// A parsed filter expression is an object with keys 'path`, 'op', 'value'.
export const stationFilterPredicate = expressions => station =>
  every(
    expression => get(expression.path, station) === expression.value
  )(expressions);
