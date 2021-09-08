// This module provides functions for filtering (metadata) from the data
// services.

// Metadata filters are specified by a string (in practice, loaded from an
// environment variable) which contains zero or more semicolon-separated
// filter expressions. A filter expression takes the form
// `<path> <op> <value>`, where
//    <path> is a JS path addressing a property in a station object,
//    <op> is a comparison operator (only = supported at the moment),
//    <value> is any valid JSON expression not containing a semicolon,
// and the filter expression components are separated by at least one space.
// All filter expressions must be satisfied to pass a metadata item.

import flow from 'lodash/fp/flow';
import split from 'lodash/fp/split';
import map from 'lodash/fp/map';
import compact from 'lodash/fp/compact';
import every from 'lodash/fp/every';
import get from 'lodash/fp/get';

const filterExpressionPattern = /(?<path>[^=]*)\s+(?<op>=|!=)\s+(?<value>.*)/;

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
  map(match => {
    try {
      return {
        path: match.groups.path,
        op: match.groups.op,
        value: JSON.parse(match.groups.value),
      };
    } catch {
      console.warn(
        `Warning: Error parsing value in filter expression: ${match.groups.value}`
      );
      return null;
    }
  }),
  compact,
);

// Given an array of parsed filter expressions, returns a predicate that
// evaluates the conjunction (and) of the expressions for a given station.
// A parsed filter expression is an object with keys 'path`, 'op', 'value'.
export const filterPredicate = expressions => item =>
  every(
    expression => {
      const itemValue = get(expression.path, item);
      switch (expression.op) {
        case '=': return itemValue === expression.value;
        case '!=': return itemValue !== expression.value;
        default: return false;
      }
    }
  )(expressions);
