import map from "lodash/fp/map";
import pipe from "lodash/fp/pipe";
import flatten from "lodash/fp/flatten";
import uniq from "lodash/fp/uniq";
import { getVariablePreview, getStationById } from "../api/metadata";

const loadPreviewStationAction = (set, get) => async (stationId) => {
  if (!get().isConfigLoaded()) {
    throw new Error("Cannot load stations until config is loaded");
  }

  // try to load station from existing metadata store slice
  console.log("### loading station preview");
  const station = get().getStationById(stationId);

  if (!station) {
    console.log("### loading station preview station", station);

    const response = await getStationById({ config: get().config, stationId });

    console.log("### loaded station", response.data);
    set({ previewStation: response.data });
  } else {
    set({ previewStation: station });
  }
};

const loadStationVariablesAction = (set, get) => async (stationId) => {
  if (!get().isConfigLoaded()) {
    throw new Error("Cannot load stations until config is loaded");
  }
  const station = get().previewStation;

  const response = await Promise.all(
    pipe(
      // (obj) iterate over station histories
      map("variable_ids"), // (int array) pluck out variableids
      flatten, // (int) flatten into a single array
      uniq, // (int) remove duplicates
      map(getVariablePreview({ stationId /* other axios config here */ })), // (Promise) http calls for each station variable
    )(station.histories),
  );
  console.log("### station preview loaded", response);
  set({ previewStationVariables: map("data")(response) });
};

const loadStationVariablesObservationsAction =
  (set, get) => async (stationId) => {
    if (!get().isConfigLoaded()) {
      throw new Error("Cannot load stations until config is loaded");
    }
    const station = get().previewStation;

    const response = await getVariablePreview({
      stationId,
      variableId /* other axios config here */,
    });
    console.log("### station preview loaded", response);
    set({ previewObservations: response.data });
  };

export const createPreviewSlice = (set, get) => ({
  previewStation: null,
  previewStationVariables: null,
  previewObservations: null,

  loadPreviewStation: loadPreviewStationAction(set, get),
  loadPreviewStationVariables: loadStationVariablesAction(set, get),
  loadSPreviewtationVariablesObservations:
    loadStationVariablesObservationsAction(set, get),
});

export default createPreviewSlice;
