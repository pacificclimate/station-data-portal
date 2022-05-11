// This module provides configuration values for consumption throughout
// the app. Currently, config values are defined only by env vars.

const strToBool = value => value.toLowerCase() === "true";

export const configString = (name, deflt = "") =>
  (process.env[`REACT_APP_${name}`] || deflt);

export const configBool = (...args) => strToBool(configString(...args));

export const stationDebugFetchOptions =
  configBool("DEBUG_STATION_FETCH_OPTIONS");

export const markerClusteringAvailable =
  configBool("MARKER_CLUSTERING_AVAILABLE");
