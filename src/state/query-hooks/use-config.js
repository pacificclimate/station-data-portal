import { useQuery } from "@tanstack/react-query";
import yaml from "js-yaml";
import filter from "lodash/fp/filter";
import isUndefined from "lodash/fp/isUndefined";

const defaultConfig = {
  adjustableColumnWidthsDefault: [7, 5],
  defaultTab: "Filters",
  defaultNetworkColor: "#000000",
  zoomToMarkerRadiusSpec: [
    [7, 2],
    [99, 4],
  ],
  userDocs: {
    showLink: false,
    url: "https://data.pacificclimate.org/portal/docs/",
    text: "User Docs",
  },
  lethargy: {
    enabled: true,
    stability: 7,
    sensitivity: 50,
    tolerance: 0.05,
  },
  disclaimer: {
    enabled: false,
    title: "Disclaimer Title",
    body: "Disclaimer body ...",
    buttonLabel: "Acknowledge",
  },
  mapSpinner: {
    spinner: "Bars",
    x: "40%",
    y: "40%",
    width: "80",
    stroke: "darkgray",
    fill: "lightgray",
  },
  maxUrlLength: 2047,
  stationDebugFetchOptions: false,
  stationDebugFetchLimits: [100, 500, 1000, 2000, 4000, 8000],
  showReloadStationsButton: false,
  timingEnabled: false,
};

const requiredConfigKeys = [
  // Absolutely required values
  "appTitle",
  "sdsUrl",
  "pdpDataUrl",
  "baseMap",

  // Required values with defaults
  "adjustableColumnWidthsDefault",
  "defaultTab",
  "defaultNetworkColor",
  "zoomToMarkerRadiusSpec",
  "lethargy",
  "userDocs",
  "mapSpinner",
  "disclaimer",
];
const checkMissingKeys = (config) => {
  const missingRequiredKeys = filter(
    (key) => isUndefined(config[key]),
    requiredConfigKeys,
  );
  if (missingRequiredKeys.length > 0) {
    throw new Error(
      `Error in config.yaml: The following keys must have values, 
      but do not: ${missingRequiredKeys}`,
    );
  }
};

const getZoomMarkerRadius = (zmrSpec) => {
  return (zoom) => {
    for (const [_zoom, radius] of zmrSpec) {
      if (zoom <= _zoom) {
        return radius;
      }
    }
    return zmrSpec[zmrSpec.length - 1][1];
  };
};

/**
 * Layer 1. Server fetch and config parsing.
 * @returns {Promise<object>}
 */
const fetchConfig = async () => {
  const loadedConfig = window.env;
  const config = { ...defaultConfig, ...loadedConfig };

  checkMissingKeys(config);

  // Extend config with some env var values
  config.appVersion = process.env.REACT_APP_APP_VERSION ?? "unknown";

  // Extend config with some computed goodies
  // TODO: Store shouldn't know about data presentation
  config.stationDebugFetchLimitsOptions = config.stationDebugFetchLimits.map(
    (value) => ({ value, label: value.toString() }),
  );

  // TODO: config shouldn't be responsible for this
  config.zoomToMarkerRadius = getZoomMarkerRadius(
    config.zoomToMarkerRadiusSpec,
  );

  return config;
};

const CONFIG_QUERY_KEY = ["config"];

export const configQuery = () => ({
  queryKey: CONFIG_QUERY_KEY,
  queryFn: fetchConfig,
  staleTime: Infinity, // config should rarely change while on the same version
});

/**
 * L2. Query hook for the config. Generally this should not be used directly but via {@link useConfigContext}
 * @returns {object}
 */
export const useConfig = () => useQuery(configQuery());
