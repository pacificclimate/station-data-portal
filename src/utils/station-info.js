import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import uniq from 'lodash/fp/uniq';
import React from 'react';
import uniqWith from 'lodash/fp/uniqWith';
import { utcDateOnly } from './dates';
import find from 'lodash/fp/find';
import flatten from 'lodash/fp/flatten';
import compact from 'lodash/fp/compact';
import tap from 'lodash/fp/tap';
import sortBy from 'lodash/fp/sortBy';
import identity from 'lodash/fp/identity';
import sortedUniq from 'lodash/fp/sortedUniq';
import curry from 'lodash/fp/curry';
import { unionAll } from './fp'


export const stationNetwork = curry(
  (networks, station) => find({ uri: station.network_uri }, networks)
);


export const stationVariableUris = station =>
  flow(
    map('variable_uris'),
    unionAll,
  )(station.histories);


export const uniqStationNames = station =>
  flow(
    map('station_name'),
    sortBy(identity),
    uniq,
  )(station.histories);


export const uniqStationLocations = station =>
  uniqWith(
    (hx1, hx2) => hx1.lon === hx2.lon
      && hx1.lat === hx2.lat
      && hx1.elevation === hx2.elevation
  )(station.histories);


export const uniqStationObsPeriods = station =>
  uniqWith(
    (hx1, hx2) =>
      utcDateOnly(hx1.min_obs_time).getTime()
      === utcDateOnly(hx2.min_obs_time).getTime()
      && utcDateOnly(hx1.max_obs_time).getTime()
      === utcDateOnly(hx2.max_obs_time).getTime()
  )(station.histories);


export const uniqStationFreqs = station =>
  flow(
    map('freq'),
    uniq,
  )(station.histories);


export const uniqStationVariableNames = curry(
  (variables, station) =>
    flow(
      map(history =>
        map(
          variable_uri => find({ uri: variable_uri }, variables),
          history.variable_uris
        )
      ),
      flatten,
      // compacting this array should not be necessary, but the API delivers
      // erroneous data (due ultimately to erroneous database records, I believe)
      // that causes some of the variables to be "missing".
      compact,
      // tap(x => console.log("### compacted vars", x)),
      map('display_name'),
      sortBy(identity),
      sortedUniq,
    )(station.histories)
);
