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

const loadMetadataAction = (set, get) => async () => {
  if (!get().isConfigLoaded()) {
    throw new Error("Cannot load stations until config is loaded");
  }
  const config = get().config;
  console.log("### loading metadata");
  set({ stations: null });
  const pStations = getStations({
    config,
    getParams: {
      compact: true,
      ...(config.stationDebugFetchOptions && { limit: get().stationsLimit }),
    },
  });
  const pNetworks = await getNetworks({ config });
  const pVariables = await getVariables({ config });
  const pFrequencies = await getFrequencies({ config });
  const response = await Promise.all([
    pStations,
    pNetworks,
    pVariables,
    pFrequencies,
  ]);
  set({
    stations: response[0].data,
    networks: response[1].data,
    variables: response[2].data,
    frequencies: response[3].data,
  });
};

export const createMetadataSlice = (set, get) => ({
  networks: null,
  variables: null,
  frequencies: null,
  stations: null,

  stationsLimit: null,

  loadMetadata: loadMetadataAction(set, get),
  loadStations: loadStationsAction(set, get),

  reloadStations: () => {
    console.log("### reloadStations");
    set({ stations: null });
    get().loadStations();
  },
  setStationsLimit: (limit) => {
    console.log("### setStationsLimit", limit);
    set({ stationsLimit: limit });
  },
});

export default createMetadataSlice;
