// This module provides functions for filtering (metadata) from the data
// services.

// Metadata filters are specified by a string (in practice, loaded from an
// environment variable) which contains zero or more semicolon-separated
// filter expressions. A filter expression takes the form
// `<path> <op> <value>`, where
//    <path> is a JS path addressing a property in a station object,
//    <op> is a comparison operator (only = supported at the moment),
//    <value> is any string not containing a semicolon.
// All filter expressions must be satisfied to pass a metadata item.
//
// A more flexible (but less safe) alternative would be to allow a filter
// expression to be any valid JS expression, and to evaluate it in the context
// of `station` using `Function`.

import flow from 'lodash/fp/flow';
import split from 'lodash/fp/split';
import map from 'lodash/fp/map';
import compact from 'lodash/fp/compact';
import every from 'lodash/fp/every';
import get from 'lodash/fp/get';

const filterExpressionPattern = /(?<path>[^=]*)(?<op>=)(?<value>.*)/;

// Converts a string to an array of parsed filter expressions.
// Any invalid expressions are flagged on the console and otherwise ignored.
// A parsed filter expression is an object with keys 'path`, 'op', 'value'.
export const filterExpressionsParser = flow(
  split(';'),
  compact,
  map(s => [s, s.match(filterExpressionPattern)]),
  map(([s, match]) => {
    if (!match) {
      console.warn(`Warning: '${s}' is not a valid filter expression`)
    }
    return match;
  }),
  compact,
  map(match => match.groups),
);

// Given an array of parsed filter expressions, returns a predicate that
// evaluates the conjunction (and) of the expressions for a given station.
// A parsed filter expression is an object with keys 'path`, 'op', 'value'.
export const filterPredicate = expressions => item =>
  every(
    expression => get(expression.path, item) === expression.value
  )(expressions);
