import {
  getStations,
  getNetworks,
  getVariables,
  getFrequencies,
} from "../api/metadata";

import flatten from "lodash/fp/flatten";
import pipe from "lodash/fp/pipe";
import map from "lodash/fp/map";
import uniq from "lodash/fp/uniq";
import { getVariablePreview } from "../api/metadata";

const loadStationsAction =
  (set, get) =>
  async ({ config }) => {
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

const loadMetadataAction =
  (set, get) =>
  async ({ config }) => {
    console.log("### loading metadata");
    set({ stations: null, loadingMeta: true });
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
      loadingMeta: false,
      stations: response[0].data,
      networks: response[1].data,
      variables: response[2].data,
      frequencies: response[3].data,
    });
  };

const loadStationPreviewAction =
  (set, get) =>
  async ({ config, stationId }) => {
    console.log("### loading station preview");
    const station = get().getStationById(stationId);
    console.log("### loading station preview station", station);
    const response = await Promise.all(
      pipe(
        // (obj) iterate over station histories
        map("variable_ids"), // (int array) pluck out variableids
        flatten, // (int) flatten into a single array
        uniq, // (int) remove duplicates
        map(
          getVariablePreview({
            config,
            stationId /* other axios config here */,
          }),
        ), // (Promise) http calls for each station variable
      )(station.histories),
    );
    console.log("### station preview loaded", response);
    set({ stationPreview: map("data")(response) });
  };

export const createMetadataSlice = (set, get) => ({
  loadingMeta: true,

  networks: null,
  variables: null,
  frequencies: null,
  stations: null,

  stationsLimit: null,

  // load actions for retrieving remote data
  loadMetadata: loadMetadataAction(set, get),
  loadStations: loadStationsAction(set, get),
  loadStationPreview: loadStationPreviewAction(set, get),

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
