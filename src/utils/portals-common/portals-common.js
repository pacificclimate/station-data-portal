import contains from 'lodash/fp/contains';
import compact from 'lodash/fp/compact';
import filter from 'lodash/fp/filter';
import flatten from 'lodash/fp/flatten';
import flow from 'lodash/fp/flow';
import intersection from 'lodash/fp/intersection';
import map from 'lodash/fp/map';
import some from 'lodash/fp/some';
import uniq from 'lodash/fp/uniq';
import isNil from 'lodash/fp/isNil';
import union from 'lodash/fp/union';
import reduce from 'lodash/fp/reduce';
import { isPointInPolygonWn } from '../geometry-algorithms';


const checkGeoJSONPolygon = geometry => {
  if (geometry['type'] !== 'MultiPolygon') {
    throw new Error(`Invalid geometry type: ${geometry['type']}`)
  }
};

const getX = point => point[0];
const getY = point => point[1];
export const isPointInGeoJSONPolygon = isPointInPolygonWn(getX, getY);


export const utcDateOnly = d => {
  // Return a new Date object which is suitable for comparing UTC date only
  // (fixed zero time component). One might suppose that the comparisons in
  // the filter below also would work with local time (Date.setHours()), but
  // they don't; only UTC works.
  if (!d) {
    return d;
  }
  const r = new Date(d);
  r.setUTCHours(0, 0, 0, 0);
  return r;
};


export const isNilOrAscending = (a, b, c) => {
  // Allowing for nils (undefined, null), check that a <= b <= c.
  return isNil(b) || ((isNil(a) || a <= b) && (isNil(c) || b <= c));
};


export const historyDateMatch = (
  history, startDate, endDate, strict = true
)  => {
  // Return true if history observation dates match start and end date.
  // Compare using dates only.
  const minObsDate = utcDateOnly(history.min_obs_time);
  const maxObsDate = utcDateOnly(history.max_obs_time);
  startDate = utcDateOnly(startDate);
  endDate = utcDateOnly(endDate);

  if (strict) {
    // Allowing for nils, check that
    // minObsDate <= startDate <= endDate <= maxObsDate.
    return (
      isNilOrAscending(startDate, endDate)
      && isNilOrAscending(minObsDate, startDate, maxObsDate)
      && isNilOrAscending(minObsDate, endDate, maxObsDate)
    );
  }

  // This is a variant of the looser legacy comparison. Allows nil start, end.
  return (
    !isNil(minObsDate) && !isNil(maxObsDate)
    && isNilOrAscending(startDate, maxObsDate)
    && isNilOrAscending(minObsDate, endDate)
  );

  // This is the looser comparison used by the legacy PDP portal.
  // return (
  //   !isNil(minObsDate) && !isNil(maxObsDate)
  //   && !isNil(startDate) && !isNil(endDate)
  //   && maxObsDate > startDate && minObsDate < endDate
  // );
};


export const stationDateMatch = (
  station, startDate, endDate, strict = true
) => {
  // TODO: Coalesce adjacent histories from a station. NB: tricky.
  //  If we don't do this, and we use strict date matching, then a station with
  //  several histories fully covering an interval will not be selected, even
  //  though it should be. The question of what "adjacent" means is a bit tricky
  //  ... would depend in part on history.freq to distinguish too-large gaps,
  //  but we already know that attribute isn't always an accurate reflection of
  //  actual observations.
  const r = flow(
    map(hx => historyDateMatch(hx, startDate, endDate, strict)),
    some(Boolean),
  )(station.histories);
  // if (!r) {
  //   console.log(`Station ${station.id} filtered out on date`)
  // }
  return r;
};


export const unionAll = reduce(union, []);

export const atLeastOne = items => items.length > 0;


export const stationReportsSomeVariables = (station, variableUris) => {
  const r = flow(
    map("variable_uris"),
    compact,
    unionAll,
    intersection(variableUris),
    atLeastOne,
  )(station.histories);
  // if (!r) {
  //   console.log(`Station ${station.id} filtered out on variables`)
  // }
  return r;
};


export const stationReportsAnyFreqs = (station, freqs) => {
  const r = flow(
    map("freq"),
    intersection(freqs),
    atLeastOne,
  )(station.histories);
  // if (!r) {
  //   console.log(`Station ${station.id} filtered out on freqs`)
  // }
  return r;
};


export const stationFilter = (
  startDate, endDate, selectedNetworks, selectedVariables, selectedFrequencies,
  onlyWithClimatology, area, allNetworks, allVariables, allStations
) => {
  // console.log('filteredStations allStations', allStations)
  const selectedVariableUris = flow(
    map(selectedVariable => selectedVariable.contexts),
    flatten,
    map(context => context.uri),
    uniq,
  )(selectedVariables);
  // console.log('filteredStations selectedVariableUris', selectedVariableUris)

  const selectedFrequencyValues =
    map(option => option.value)(selectedFrequencies);
  // console.log('filteredStations selectedVariableUris', selectedVariableUris)

  console.group("stationFilter")
  const r = flow(
    // tap(s => console.log("all stations", s?.length)),

    filter(station => {
      return (
        stationDateMatch(station, startDate, endDate, false)

        // Station is part of one of selected networks
        && contains(
          station.network_uri,
          map(nw => nw.value.uri)(selectedNetworks)
        )

        && stationReportsSomeVariables(station, selectedVariableUris)
        && stationReportsAnyFreqs(station, selectedFrequencyValues)
      );
    }),
    // tap(s => console.log("after date etc filtering", s?.length)),

    // Stations match `onlyWithClimatology`:
    // If `onlyWithClimatology`, station reports a climatology variable.
    filter(station => {
      if (!onlyWithClimatology) {
        return true;
      }
      return flow(
        // Select variables that station reports
        filter(({ uri }) => contains(uri, station.histories[0].variable_uris)),
        // Test that some reported variable is a climatology -- criterion from
        // PDP PCDS backend
        some(({ cell_method }) => /(within|over)/.test(cell_method))
      )(allVariables)
    }),
    // tap(s => console.log("after onlyWithClimatology filtering", s?.length)),

    // Stations are inside `area`
    filter(station => {
      if (!area) {
        return true;
      }
      //area will always be a geoJSON MultiPolygon (even if there's only one polygon)
      checkGeoJSONPolygon(area);

      //return true if the station is in any selected polygon
      return some(poly => isPointInGeoJSONPolygon(poly[0],
            [station.histories[0].lon, station.histories[0].lat] ))(area.coordinates);

    }),
    // tap(s => console.log("after area filtering", s?.length)),
  )(allStations);

  console.groupEnd()
  return r;
};
