// This module provides configuration values for consumption throughout
// the app. Currently, config values are defined only by env vars.

import flow from 'lodash/fp/flow';
import split from 'lodash/fp/split';
import map from 'lodash/fp/map';

const strToBool = value => (value ?? "").toLowerCase() === "true";

export const configString = (name, deflt = "") =>
  (process.env[`REACT_APP_${name}`] || deflt);

export const configBool = (...args) => strToBool(configString(...args));

export const stationDebugFetchOptions =
  configBool("DEBUG_STATION_FETCH_OPTIONS");

export const markerClusteringAvailable =
  configBool("MARKER_CLUSTERING_AVAILABLE");

export const showReloadStationsButton =
  configBool("SHOW_RELOAD_STATIONS_BUTTON");

export const showDevTab = configBool("SHOW_DEV_TAB");

let zoomToMarkerRadiusSpec = [
  [7, 10], [99, 4],
];
try {
  zoomToMarkerRadiusSpec = flow(
    split(";"),
    map(
      flow(
        split(","),
        map(s => {
          const n = +s;
          if (isNaN(n)) {
            throw `'${s}' is not a number`;
          }
          return n;
        }),
      )
    ),
  )(configString("ZOOM_TO_MARKER_RADIUS", "7,2;99,4"));
} catch (e) {
  console.error(
    `Error: ZOOM_TO_MARKER_RADIUS value '${configString("ZOOM_TO_MARKER_RADIUS")}' not valid: ${e}`
  )
}
export { zoomToMarkerRadiusSpec }
