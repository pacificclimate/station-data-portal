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
    (station, variableIds) => {
      const stationVariableIds = ft.timeThis("stationVariableIds")(flow(
        map("variable_ids"),
        flatten,
      ))(station.histories);
      const r = ft.timeThis("variableUri in stationVariableIds")(
        some(uri => contains(uri, stationVariableIds))
      )(variableIds);
      // if (!r) {
      //   console.log(`Station ${station.id} filtered out on variables`)
      // }
      return r;
    }
  );


export const stationReportsAnyFreqs = ft.timeThis("stationReportsAnyFreqs")(
    (station, freqs) => {
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


export const stationFilter = (
  startDate, endDate, selectedNetworks, selectedVariables, selectedFrequencies,
  onlyWithClimatology, area, allNetworks, allVariables, allStations
) => {
  ft.resetAll();
  const selectedVariableIds = ft.timeThis("selectedVariableIds")(flow(
    map(selectedVariable => selectedVariable.contexts),
    flatten,
    map(context => context.id),
    uniq,
  ))(selectedVariables);

  const selectedFrequencyValues =
    map(option => option.value)(selectedFrequencies);

  const climatologyVariableIds = ft.timeThis("climatologyVariableIds")(
    flow(
      filter(({ cell_method }) => /(within|over)/.test(cell_method)),
      map("id"),
    )
  )(allVariables);

  const r = filter(station => (
        stationMatchesDates(station, startDate, endDate, false)
        && stationInAnyNetwork(station, selectedNetworks)
        && stationReportsSomeVariables(station, selectedVariableIds)
        && stationReportsAnyFreqs(station, selectedFrequencyValues)
        && (
          !onlyWithClimatology ||
          stationReportsClimatologyVariable(station, climatologyVariableIds)
        )
      )
    )(allStations);

  ft.log();
  return r;
};
