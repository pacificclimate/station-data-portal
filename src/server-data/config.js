import { promises as fs } from "fs";
import path from "path";
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

const loadConfig = async () => {
  let config = {};
  try {
    const response = await fs.readFile(
      path.join(process.cwd(), "src/app/config.yaml"),
    );
    const yamlConfig = response.toString();
    const fetchedConfig = yaml.load(yamlConfig);
    config = { ...defaultConfig, ...fetchedConfig };
  } catch (error) {
    console.log(error);
    throw error;
  }

  try {
    checkMissingKeys(config);
  } catch (error) {
    console.log(error);
    throw error;
  }

  // Extend config with some env var values
  config.appVersion = process.env.REACT_APP_APP_VERSION ?? "unknown";

  return config;
};

export const config = await loadConfig();

export default config;
