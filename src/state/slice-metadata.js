import {
  getStations,
  getNetworks,
  getVariables,
  getFrequencies,
} from "../api/metadata";

const loadStationsAction = (set, get) => async () => {
  if (!get().isConfigLoaded()) {
    throw new Error("Cannot load stations until config is loaded");
  }
  const config = get().config;
  console.log("### loading stations");
  set({ stations: null });
  const response = await getStations({
    config,
    getParams: {
      compact: true,
      ...(config.stationDebugFetchOptions && { limit: get().stationsLimit }),
    },
  });
  console.log("### stations loaded");
  set({ stations: response.data });
};

const clearMetadataAction = (set) => () => {
  set({
    stations: null,
    networks: null,
    variables: null,
    frequencies: null,
  });
};

const loadMetadataAction = (set, get) => async () => {
  if (!get().isConfigLoaded()) {
    throw new Error("Cannot load stations until config is loaded");
  }
  const config = get().config;
  console.log("### loading metadata");
  get().clearMetadata();
  set({ loadingMeta: true });
  const pNetworks = getNetworks({ config });
  const pVariables = getVariables({ config });
  const pFrequencies = getFrequencies({ config });
  const response = await Promise.all([pNetworks, pVariables, pFrequencies]);
  set({
    loadingMeta: false,
    networks: response[0].data,
    variables: response[1].data,
    frequencies: response[2].data,
  });
};

export const createMetadataSlice = (set, get) => ({
  loadingMeta: true,

  networks: null,
  variables: null,
  frequencies: null,
  stations: null,

  stationsLimit: null,

  clearMetadata: clearMetadataAction(set),
  // load actions for retrieving remote data
  loadMetadata: loadMetadataAction(set, get),
  loadStations: loadStationsAction(set, get),

  reloadStations: () => {
    console.log("### reloadStations");
    set({ stations: null });
    get().loadStations();
  },

  // getters
  getStationById: (stationId) => {
    console.log("### getStationById", stationId);
    if (get().loadingMeta) {
      return null;
    }
    console.log("### getStationById loaded", stationId);
    return get().stations?.find((station) => station.id === +stationId);
  },

  // setters
  setStationsLimit: (limit) => {
    console.log("### setStationsLimit", limit);
    set({ stationsLimit: limit });
  },
});

export default createMetadataSlice;
