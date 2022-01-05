import contains from 'lodash/fp/contains';
import every from 'lodash/fp/every';
import filter from 'lodash/fp/filter';
import flatten from 'lodash/fp/flatten';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import min from 'lodash/fp/min';
import max from 'lodash/fp/max';
import some from 'lodash/fp/some';
import uniq from 'lodash/fp/uniq';
import isNil from 'lodash/fp/isNil';
import flattenDepth from 'lodash/fp/flattenDepth';
import { isPointInPolygonWn } from '../geometry-algorithms';
import { stationVariableUris, uniqStationLocations } from '../station-info';
import { getTimer } from '../timing';

const ft = getTimer("Station filtering timing")
ft.log();


// GeoJSON MultiPolygon format. Taken from
// https://conservancy.umn.edu/bitstream/handle/11299/210208/GeoJSON_Primer_2019.pdf
//
// {
//   "type": "MultiPolygon",
//   "coordinates": [
//     // one or more Polygon coordinate array:
//     [
//       // one or more Linear ring coordinate arrays:
//       [
//          // at least four Points; first point = last point:
//         [x0, y0],
//         [x1, y1],
//         [x2, y2],
//         // ...
//         [x0, y0]
//       ],
//       // ...
//     ],
//     // ...
//   ],
//   // ...
// };


const checkGeoJSONMultiPolygon = geometry => {
  if (geometry['type'] !== 'MultiPolygon') {
    throw new Error(`Invalid geometry type: ${geometry['type']}`)
  }
};


const gJMultiPolygonBoundingBox = geometry => {
  const points = flattenDepth(3, geometry["coordinates"]);
  const xs = map(p => p[0], points);
  const ys = map(p => p[1], points);
  return [
    [min(xs), max(ys)], // top left
    [max(xs), min(ys)], // bottom right
  ]
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
    // TODO: Optimize
    return (
      isNilOrAscending(startDate, endDate)
      && isNilOrAscending(minObsDate, startDate, maxObsDate)
      && isNilOrAscending(minObsDate, endDate, maxObsDate)
    );
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
    (station, variableUris) => {
      const stationVariableUris = ft.timeThis("stationVariableUris")(flow(
        map("variable_uris"),
        flatten,
      ))(station.histories);
      const r = ft.timeThis("variableUri in stationVariableUris")(
        some(uri => contains(uri, stationVariableUris))
      )(variableUris);
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


export const stationReportsClimatologyVariable = ft.timeThis("stationReportsClimatologyVariable")((station, variables) => {
  return flow(
    // Select variables that station reports
    filter(({ uri }) => contains(uri, stationVariableUris(station))),
    // Test that some reported variable is a climatology -- criterion from
    // PDP PCDS backend
    some(({ cell_method }) => /(within|over)/.test(cell_method))
  )(variables);
});


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
  const selectedVariableUris = ft.timeThis("selectedVariableUris")(flow(
    map(selectedVariable => selectedVariable.contexts),
    flatten,
    map(context => context.uri),
    uniq,
  ))(selectedVariables);

  const selectedFrequencyValues =
    map(option => option.value)(selectedFrequencies);

  const r = filter(station => (
        stationMatchesDates(station, startDate, endDate, false)
        && stationInAnyNetwork(station, selectedNetworks)
        && stationReportsSomeVariables(station, selectedVariableUris)
        && stationReportsAnyFreqs(station, selectedFrequencyValues)
        && (
          !onlyWithClimatology ||
          stationReportsClimatologyVariable(station, allVariables)
        )
      )
    )(allStations);

  ft.log();
  return r;
};
