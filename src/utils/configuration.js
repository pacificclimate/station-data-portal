// This module provides configuration values for consumption throughout
// the app. Currently, config values are defined only by env vars.

import isNil from 'lodash/fp/isNil';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import fromPairs from 'lodash/fp/fromPairs';
import toPairs from 'lodash/fp/toPairs';
import toNumber from 'lodash/fp/toNumber';
const strToBool = value => "true".startsWith(value.toLowerCase());

// console.log("### process.env", process.env)

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
export const configJson = makeConfig(v => {
  try {
    return JSON.parse(v);
  } catch (e) {
    console.error("Error parsing JSON from config variable", e);
    return undefined;
  }
});

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
  appTitle: [configString, ""],
  appVersion: [configString, ""],
  adjustableColumnWidthsDefault: [configJson, [7, 5]],
  defaultTab: [configString, "Filters"],
  pdpDataUrl: [configString, ""],
  sdsUrl: [configString, ""],
  networkFilters: [configString, ""],
  stationFilters: [configString, ""],
  stationsQpProvinces: [configString, undefined],
  baseMap: [configString, "BC"],
  defaultNetworkColor: [configString, "#000000"],
  userDocsShowLink: [configBool, false],
  userDocsUrl: [configString, "https://data.pacificclimate.org/portal/docs/"],
  userDocsText: [configString, "User Docs"],
  lethargy: [configJson, {
    enabled: true,
    stability: 7,
    sensitivity: 50,
    tolerance: 0.05,
  }],
  disclaimer: [configJson, {
    enabled: false,
    title: "Disclaimer Title",
    body: "Disclaimer body ...",
    buttonLabel: "Acknowledge",
  }],
  mapSpinner: [configJson, {
    spinner: "Bars",
    x: "40%",
    y: "40%",
    width: "80",
    stroke: "darkgray",
    fill: "lightgray",
  }],
  stationDebugFetchOptions: [configBool, false],
  stationDebugFetchLimits: [configJson, [100, 500, 1000, 2000, 4000, 8000]],
  stationOffset: [configNumber, undefined],
  stationLimit: [configNumber, undefined],
  stationStride: [configNumber, undefined],
  showReloadStationsButton: [configBool, false],
  timingEnabled: [configBool, false],
});

config.stationDebugFetchLimitsOptions = config.stationDebugFetchLimits.map(
  value => ({ value, label: value.toString() })
);

console.log("### config", config)

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
