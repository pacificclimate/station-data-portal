// This module provides configuration values for consumption throughout
// the app. Currently, config values are defined only by env vars.

import isNil from 'lodash/fp/isNil';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import fromPairs from 'lodash/fp/fromPairs';
import toPairs from 'lodash/fp/toPairs';
import toNumber from 'lodash/fp/toNumber';
const strToBool = value => "true".startsWith(value.toLowerCase());

console.log("### process.env", process.env)

// Utility functions

const getEnvVar = (name, prefix = "REACT_APP_") =>
  process.env[`${prefix}${name}`];

const makeConfig = convert => (name, deflt) => {
  const val = getEnvVar(name);
  return isNil(val) ? deflt : convert(val);
}

export const configString = makeConfig(v => v);
export const configBool = makeConfig(strToBool);
export const configNumber = makeConfig(toNumber);
export const configJson = makeConfig(JSON.parse);

const camelToSnakeCase = str =>
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const getConfigValues = flow(
  toPairs,
  map(([key, [convert, deflt]]) =>
    [key, convert(camelToSnakeCase(key).toUpperCase(), deflt)]),
  fromPairs,
);


// Configuration values

export const config = getConfigValues({
  defaultNetworkColor: [configString, "#000000"],
  baseMap: [configString, "BC"],
  defaultTab: [configString, "Filters"],
  appTitle: [configString, ""],
  appVersion: [configString, ""],
  pdpDataUrl: [configString, ""],
  sdsUrl: [configString, ""],
  networkFilters: [configString, ""],
  stationFilters: [configString, ""],
  stationOffset: [configNumber, undefined],
  stationLimit: [configNumber, undefined],
  stationStride: [configNumber, undefined],
  stationsQpProvinces: [configString, undefined],
  userDocsShowLink: [configBool, false],
  userDocsUrl: [configString, "https://data.pacificclimate.org/portal/docs/"],
  userDocsText: [configString, "User Docs"],
  lethargyEnabled: [configBool, false],
  lethargyStability: [configNumber, 7],
  lethargySensitivity: [configNumber, 50],
  lethargyTolerance: [configNumber, 0.05],
  disclaimerEnabled: [configBool, false],
  disclaimerTitle: [configString, "Disclaimer Title"],
  disclaimerBody: [configString, "Disclaimer body ..."],
  disclaimerButtonLabel: [configString, "Acknowledge"],
  stationDebugFetchOptions: [configBool, false],
  markerClusteringAvailable: [configBool, false],
  showReloadStationsButton: [configBool, false],
  timingEnabled: [configBool, false],
});
// console.log("### config", config)

const zoomToMarkerRadiusSpec = configJson(
  "ZOOM_TO_MARKER_RADIUS", [ [7,2], [99,4] ]
)
// Convert a zoom level to a marker radius according to zoomToMarkerRadiusSpec,
// which is an array of pairs of [zoom, radius] values, in ascending order of
// zoom. This value is set from an env var.
export function zoomToMarkerRadius(zoom) {
  for (const [_zoom, radius] of zoomToMarkerRadiusSpec) {
    if (zoom <= _zoom) {
      return radius;
    }
  }
  return zoomToMarkerRadiusSpec[zoomToMarkerRadiusSpec.length-1][1];
}
