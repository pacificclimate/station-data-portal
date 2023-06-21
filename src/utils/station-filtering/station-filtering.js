// Functions for filtering stations based on various criteria (station network,
// observation date range, etc.).
//
// **Important information** about the meaning of the value of `history.freq`:
//
// Null for this value means that a frequency has not been assigned.
//
// Null is common as the frequency is assigned by an algorithm that appears
// to be a heuristic for determining the most common observation interval,
// followed by a transformation to a human-friendly string representing that
// interval.
//
// The [heuristic](https://github.com/pacificclimate/crmp/blob/master/package/R/crmp-class.r#L712)
// computes a value in hours representing the most common inter-observation
// period (not frequency) in hours.
//
// The results of the heuristic are (I think), by some code not in this
// particular codebase, transformed by
// [this function](https://github.com/pacificclimate/crmp/blob/master/package/R/crmp-class.r#L726)
// into the strings that are the values of `history.freq`.
//
// This algorithm (heuristic, then transformation to string) is manually
// applied to the database on an ad-hoc basis.
//
// The heuristic returns a zero value when it receives zero "rows", i.e.
// zero observations. This will be the case for any histories without
// associated observations. A zero value is transformed to the string
// "irregular".
//
// Unfortunately there is a second case in which the value of `freq` is
// "irregular": When the transformation algorithm does not find a "cluster"
// (of interval values, presumably; clustered by what, how?) with a clustering
// weight greater than a threshold. In other words, if the intervals are
// all over the place, then it also returns "irregular".
//
// This overloads the ultimate meaning of the value "irregular".
//
// In neither case, null or "irregular", interpret the meaning of
// `history.freq` with respect to the condition "stations with no observations".
// The null case means that the algorithm has not been run, and this says
// nothing about the number of observations. The "irregular" case means that
// either there are no observations or there are observations but their time
// pattern is irregular.
//
// However, for the purpose of that interpretation, we can supply information
// derived from a broader examination of the `history`: If the history has
// the hallmarks of no observations, namely that the variables array is empty,
// then we know more. In that case we ignore the contents of the `freq`
// attribute and assign a status of "no observations" and pass the filter,
// regardless of selected frequencies (just as we do for variable filtering).
// If not, then we apply the usual filtering.

import contains from 'lodash/fp/contains';
import every from 'lodash/fp/every';
import filter from 'lodash/fp/filter';
import flatten from 'lodash/fp/flatten';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import some from 'lodash/fp/some';
import uniq from 'lodash/fp/uniq';
import isNil from 'lodash/fp/isNil';
import { utcDateOnly } from '../dates';
import {
  checkGeoJSONMultiPolygon, gJMultiPolygonBoundingBox, isPointInGeoJSONPolygon,
} from '../geoJSON';
import { stationVariableIds, uniqStationLocations } from '../station-info';
import { getTimer } from '../timing';

const ft = getTimer("Station filtering timing")
ft.log();


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
    // TODO , or remove strict
    // Allowing for nils, check that
    // minObsDate <= startDate <= endDate <= maxObsDate.
    return true;
  }

  // This is a variant of the looser legacy comparison. Allows nil start, end.
  return (
    (isNil(startDate) || isNil(maxObsDate) || startDate <= maxObsDate)
    && (isNil(endDate) || isNil(minObsDate) || endDate >= minObsDate)
  );
};


export const stationMatchesDates = ft.timeThis("stationMatchesDates")(
  (station, startDate, endDate, strict = true) => {
    // TODO: Coalesce adjacent histories from a station. NB: tricky.
    //  If we don't do this, and we use strict date matching, then a station with
    //  several histories fully covering an interval will not be selected, even
    //  though it should be. The question of what "adjacent" means is a bit tricky
    //  ... would depend in part on history.freq to distinguish too-large gaps,
    //  but we already know that attribute isn't always an accurate reflection of
    //  actual observations.
    const r = some(
      hx => historyDateMatch(hx, startDate, endDate, strict),
      station.histories
    );
    // if (!r) {
    //   console.log(`Station ${station.id} filtered out on date`)
    // }
    return r;
  }
);

export const stationInAnyNetwork = ft.timeThis("stationInAnyNetwork")(
    (station, networks) => {
    return contains(
      station.network_uri,
      map(nw => nw.value.uri, networks)
    );
  }
);


export const atLeastOne = items => items.length > 0;


export const stationReportsSomeVariables =
  ft.timeThis("stationReportsSomeVariables")(
    (station, variableIds, includeStationsWithNoObs) => {
      const stationVariableIds = ft.timeThis("stationVariableIds")(flow(
        map("variable_ids"),
        flatten,
      ))(station.histories);
      // If there are no observations (no variables), and we are including
      // stations with no observations, then return true.
      if (includeStationsWithNoObs && stationVariableIds.length === 0) {
        return true;
      }
      // Otherwise, match based on variable ids recorded in station histories.
      const r = some(uri => contains(uri, stationVariableIds))(variableIds);
      // if (!r) {
      //   console.log(`Station ${station.id} filtered out on variables`)
      // }
      return r;
    }
  );


export const stationReportsAnyFreqs = ft.timeThis("stationReportsAnyFreqs")(
    (station, freqs, includeStationsWithNoObs) => {
      // See comments at top of module regarding the meaning of `history.freq`
      // when there are no observations for that history. That explains the
      // following code.

      // Compute the observation variables for this station. There are
      // no observations if and only if there are no variables.
      const stationVariableIds = flow(
        map("variable_ids"),
        flatten,
      )(station.histories);
      // If there are no observations (no variables), and we are including
      // stations with no observations, then return true.
      if (includeStationsWithNoObs && stationVariableIds.length === 0) {
        return true;
      }
      // Otherwise, match based on frequencies recorded in station histories.
      const stationFreqs = ft.timeThis("stationFreqs")(
        map("freq"),
      )(station.histories);
      const r = ft.timeThis("freq in stationFreqs")(
        some(freq => contains(freq, stationFreqs))
      )(freqs);
      // if (!r) {
      //   console.log(`Station ${station.id} filtered out on freqs`)
      // }
      return r;
    }
);


export const stationReportsClimatologyVariable = ft.timeThis("stationReportsClimatologyVariable")(
  (station, climatologyVariableIds) => {
    // return stationVariableIds intersect climatologyVariableIds not empty
    const sVIs = stationVariableIds(station);
    return some(sVI => contains(sVI, climatologyVariableIds))(sVIs);
  }
);


// Checker for station inside polygon. Slightly optimized.
// Intended use is one polygon and many stations.
// Returns a function that checks a station against the given polygon.
export const stationInsideMultiPolygon = ft.timeThis("stationInsideMultiPolygon")(multiPolygon => {
  // polygon should always be a geoJSON MultiPolygon (even if there's only
  // one polygon)
  if (!multiPolygon) {
    return () => true;
  }

  checkGeoJSONMultiPolygon(multiPolygon);
  // TODO: Is it worth checking bounding box?
  const [[minLon, maxLat], [maxLon, minLat]] =
    gJMultiPolygonBoundingBox(multiPolygon);

  return station => {
    const stationCoords = flow(
      uniqStationLocations,
      map(history => [history.lon, history.lat]),
    )(station);
    
    // Check bounding box
    if (
      every(
        ([lon, lat]) =>
          lon < minLon || lon > maxLon || lat < minLat || lat > maxLat,
        stationCoords
      )
    ) {
      return false;
    }

    //return true if any station coordinate is in any selected polygon
    return some(
      point => some(
        polygon => isPointInGeoJSONPolygon(polygon[0], point),
        multiPolygon.coordinates
      ),
      stationCoords
    );
  }
});


export const stationFilter = ({
  filterValues: {
    includeStationsWithNoObs,
    startDate,
    endDate,
    selectedNetworksOptions,
    selectedVariablesOptions,
    selectedFrequenciesOptions,
    onlyWithClimatology,
  },
  metadata: {
    variables: allVariables,
    stations: allStations,
  },
}) => {
  ft.resetAll();
  const selectedVariableIds = ft.timeThis("selectedVariableIds")(flow(
    map(selectedVariable => selectedVariable.contexts),
    flatten,
    map(context => context.id),
    uniq,
  ))(selectedVariablesOptions);

  const selectedFrequencyValues =
    map(option => option.value)(selectedFrequenciesOptions);

  const climatologyVariableIds = ft.timeThis("climatologyVariableIds")(
    flow(
      filter(({ tags }) => contains("climatology", tags)),
      map("id"),
    )
  )(allVariables);

  const r = filter(station => (
        stationMatchesDates(station, startDate, endDate, false)
        && stationInAnyNetwork(station, selectedNetworksOptions)
        && stationReportsSomeVariables(
          station, selectedVariableIds, includeStationsWithNoObs
        )
        && stationReportsAnyFreqs(
          station, selectedFrequencyValues, includeStationsWithNoObs
        )
        && (
          !onlyWithClimatology ||
          stationReportsClimatologyVariable(station, climatologyVariableIds)
        )
      )
    )(allStations);

  ft.log();
  return r;
};


export const stationAreaFilter = (area, stations) => {
  ft.resetAll();
  const r = filter(stationInsideMultiPolygon(area), stations);
  ft.log();
  return r;
}