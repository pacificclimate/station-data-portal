import axios from 'axios';
import yaml from "js-yaml";
import filter from "lodash/fp/filter";
import isUndefined from "lodash/fp/isUndefined";

const defaultConfig = {
  adjustableColumnWidthsDefault: [7, 5],
  defaultTab: "Filters",
  defaultNetworkColor: "#000000",
  zoomToMarkerRadiusSpec: [[7, 2], [99, 4]],
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
]
const checkMissingKeys = (config) => {
  const missingRequiredKeys = filter(
    key => isUndefined(config[key]), requiredConfigKeys
  );
  if (missingRequiredKeys.length > 0) {
    throw new Error(
      `Error in config.yaml: The following keys must have values, 
      but do not: ${missingRequiredKeys}`
    );
  }
}



const getZoomMarkerRadius = (zmrSpec) => {
  return zoom => {
    for (const [_zoom, radius] of zmrSpec) {
      if (zoom <= _zoom) {
        return radius;
      }
    }
    return zmrSpec[zmrSpec.length - 1][1];
  };
}


export const loadConfigAction = (set, get) => {
  return async () => {
    let config = {};
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/config.yaml`);
      const yamlConfig = await response.text();
      const fetchedConfig = yaml.load(yamlConfig);
      config = { ...defaultConfig, ...fetchedConfig };
    } catch (error) {
      set({
        configError: (
          <div>Error loading or parsing config.yaml: <pre>{error.toString()}</pre></div>
        )
      });
      throw error;
    }

    try {
      checkMissingKeys(config);
    } catch (error) {
      set({
        configError: error.toString()
      });
      throw error;
    }

    // Extend config with some env var values
    config.appVersion = process.env.REACT_APP_APP_VERSION ?? "unknown";

    // Extend config with some computed goodies
    config.stationDebugFetchLimitsOptions = config.stationDebugFetchLimits.map(
      value => ({ value, label: value.toString() })
    );

    config.zoomToMarkerRadius = getZoomMarkerRadius(config.zoomToMarkerRadiusSpec)


    set({ config });
  }
};