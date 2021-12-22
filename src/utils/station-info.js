import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import uniq from 'lodash/fp/uniq';
import React from 'react';
import uniqWith from 'lodash/fp/uniqWith';
import { utcDateOnly } from './portals-common';

export const uniqStationNames = station =>
  flow(
    map('station_name'),
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
