import filter from "lodash/fp/filter";
import flow from "lodash/fp/flow";
import map from "lodash/fp/map";
import max from "date-fns/max";
import min from "date-fns/min";
import isEqual from "date-fns/isEqual";
import addMonths from "date-fns/addMonths";
import subMonths from "date-fns/subMonths";
import parseIso from "date-fns/parseISO";
import {
  getStationById,
  getStationVariables,
  getStationVariablesObservations,
} from "../api/metadata";

const getMaxEndDate = flow(
  map("max_obs_time"), // (string []) Pluck max_obs_time from variable objects (ISO 8601 date string)
  map(parseIso), // (Date []) Parse ISO 8601 date strings to JS Date objects
  max, // (Date) Get the latest date
);
const getMinStartDate = flow(
  map("min_obs_time"), // (string []) Pluck min_obs_time from variable objects (ISO 8601 date string)
  map(parseIso), // (Date []) Parse ISO 8601 date strings to JS Date objects
  min, // (Date) Get the earliest date
);

const loadPreviewStationAction = (set, get) => async (stationId) => {
  try {
    if (!get().isConfigLoaded()) {
      throw new Error("Cannot load stations until config is loaded");
    }

    // try to load station from existing metadata store slice
    console.log("### loading station preview");
    // when changing stations we're essentially clearing an resetting the view state
    get().clearRanges();
    get().clearErrors();
    get().clearStation();
    const station = get().getStationById(stationId);

    // fall back to loading from server
    if (!station) {
      console.log("### loading station preview station", station);

      const response = await getStationById({
        config: get().config,
        stationId,
      });

      console.log("### loaded station", response.data);
      // I hope this object (from /stations/:station_id) is the same as the one
      // that comes back from /stations
      set({ previewStation: response.data });
    } else {
      set({ previewStation: station });
    }
  } catch (error) {
    console.error("### error loading station", error);
    set({ previewStationError: error });
  }
};

const loadPreviewStationVariablesAction = (set, get) => async () => {
  try {
    if (!get().isConfigLoaded()) {
      throw new Error("Cannot load stations until config is loaded");
    }
    const station = get().previewStation;

    if (!station) {
      throw new Error("Cannot load variables without a station");
    }

    const response = await getStationVariables({
      config: get().config,
      stationId: station.id,
    });

    const variables = filter((variable) =>
      variable.tags.includes("observation"),
    )(response.data.variables);
    const maxEndDate = getMaxEndDate(variables);
    const selectedStartDate = subMonths(maxEndDate, get().selectedDuration);

    console.log("### selected date range", selectedStartDate, maxEndDate);

    // set default range
    set({
      selectedStartDate: selectedStartDate,
      selectedEndDate: maxEndDate,
      maxEndDate: maxEndDate,
      minStartDate: getMinStartDate(variables),
    });

    console.log("### loaded station variables", variables);

    set({ previewStationVariables: variables });

    // start loading observations for graphs this could be called in the component
    // unsure of best practice here. Loading it earlier here in the store should make
    // the data load faster and more reliably (we'll only call this once)
    get().loadSPreviewStationVariablesObservations();
  } catch (error) {
    console.error("### error loading station variables", error);
    set({ previewStationVariablesError: error });
  }
};

const loadPreviewStationVariablesObservationsAction =
  (set, get) => async () => {
    try {
      if (!get().isConfigLoaded()) {
        throw new Error("Cannot load stations until config is loaded");
      }

      const {
        previewStation,
        previewStationVariables,
        selectedStartDate,
        selectedEndDate,
      } = get();

      if (
        !previewStation ||
        !previewStationVariables ||
        !selectedStartDate ||
        !selectedEndDate
      ) {
        throw new Error(
          "Cannot load observations without a station, variables, or range",
        );
      }

      get().clearErrors();
      get().clearObservations();

      const requests = flow(
        map("id"), // (int []) Pluck IDs from variable objects
        map(
          getStationVariablesObservations({
            config: get().config,
            stationId: previewStation.id,
            startDate: selectedStartDate,
            endDate: selectedEndDate,
          }),
        ), // (Promise []) Get observations for each variable
      )(previewStationVariables);

      console.log("### loading station preview observations", requests);

      const response = await Promise.all(requests);
      set({ previewObservations: map("data")(response) });
      console.log("### final store state:", get());
    } catch (error) {
      console.error("### error loading station observations", error);
      set({ previewObservationsError: error });
    }
  };

export const createPreviewSlice = (set, get) => ({
  // for simplicity's sake and while the app is small I'm keeping to a flat state structure
  // this could be broken up into a more tree-like structure if the app grows and naming
  // collisions become an issue. leveraging something like immer would also be a good idea
  // to facilitate more complex state updates.

  // set functions also cause the store to update its dependent date from the server. ie updating selected
  // data range will cause the store to fetch the data for that range.

  // null states are used to indicate that the data is not loaded
  // or there is no error. If defaults are applicable they can also be set.
  previewStation: null,
  previewStationError: null,
  previewStationVariables: null,
  previewStationVariablesError: null,
  previewObservations: null,
  previewObservationsError: null,

  maxEndDate: null,
  minStartDate: null,

  selectedStartDate: null,
  selectedEndDate: null,
  selectedDuration: 6,

  showLegend: true,

  /**
   *
   * @param {Date} date
   */
  setSelectedStartDate: (date) => {
    const initialDate = get().selectedStartDate;
    if (!isEqual(initialDate, date)) {
      set({ selectedStartDate: date, selectedEndDate: addMonths(date, 6) });
      get().loadSPreviewStationVariablesObservations();
    }
  },

  /**
   *
   * @param {Date} date
   */
  setSelectedEndDate: (date) => {
    const initialDate = get().selectedEndDate;
    if (!isEqual(initialDate, date)) {
      set({ selectedEndDate: date, selectedStartDate: subMonths(date, 6) });
      get().loadSPreviewStationVariablesObservations();
    }
  },

  /**
   *
   * @param {number} months
   */
  setDurationBeforeEnd: (months) => {
    const initialDuration = get().selectedDuration;
    if (initialDuration !== months) {
      set({
        selectedDuration: months,
        selectedStartDate: subMonths(get().selectedEndDate, months),
      });
      get().loadSPreviewStationVariablesObservations();
    }
  },

  // each clear function should reset the state to its initial value and its dependent data states
  clearStation: () => {
    set({
      previewStation: null,
      previewStationVariables: null,
      previewObservations: null,
    });
  },

  clearStationVariables: () => {
    set({
      previewStationVariables: null,
      previewObservations: null,
    });
  },

  clearObservations: () => {
    set({
      previewObservations: null,
    });
  },

  clearErrors: () => {
    set({
      previewStationError: null,
      previewStationVariablesError: null,
      previewObservationsError: null,
    });
  },
  clearRanges: () => {
    set({
      maxEndDate: null,
      minStartDate: null,
      selectedStartDate: null,
      selectedEndDate: null,
      selectedDuration: 6,
    });
  },

  toggleLegend: () => {
    set({ showLegend: !get().showLegend });
  },

  loadPreviewStation: loadPreviewStationAction(set, get),
  loadPreviewStationVariables: loadPreviewStationVariablesAction(set, get),
  loadSPreviewStationVariablesObservations:
    loadPreviewStationVariablesObservationsAction(set, get),
});

export default createPreviewSlice;
