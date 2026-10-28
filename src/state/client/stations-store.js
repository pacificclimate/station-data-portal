import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useStationsStore = create(
  devtools((set, get) => ({
    metadataCompact: false,
    setMetadataCompact: (metadataCompact) => set({ metadataCompact }),
    metadataSelectedOnly: false,
    setMetadataSelectedOnly: (metadataSelectedOnly) =>
      set({ metadataSelectedOnly }),
    metadataFilters: { history: [], station: [] },
    setMetadataFilters: (view, filters) =>
      set((state) =>
        state.metadataFilters[view] === filters
          ? state
          : { metadataFilters: { ...state.metadataFilters, [view]: filters } },
      ),

    focusedStation: null,
    focusStation: (station) =>
      set({ focusedStation: { ...station }, stationPopupRequest: null }),
    clearStationFocus: () =>
      set({ focusedStation: null, stationPopupRequest: null }),

    stationPopupRequest: null,
    requestStationPopup: (stationId) =>
      set({ stationPopupRequest: { stationId } }),
    clearStationPopupRequest: () => set({ stationPopupRequest: null }),

    downloadStations: [],
    setStationDownloadSelected: (station, selected) =>
      set((state) => ({
        downloadStations: selected
          ? state.downloadStations.some(({ id }) => id === station.id)
            ? state.downloadStations
            : [...state.downloadStations, station]
          : state.downloadStations.filter(({ id }) => id !== station.id),
      })),
    selectStationsForDownload: (stations) =>
      set((state) => ({
        downloadStations: [
          ...new Map(
            [...state.downloadStations, ...stations].map((station) => [
              station.id,
              station,
            ]),
          ).values(),
        ],
      })),
    deselectStationsForDownload: (stations) => {
      const ids = new Set(stations.map(({ id }) => id));
      set((state) => ({
        downloadStations: state.downloadStations.filter(
          ({ id }) => !ids.has(id),
        ),
      }));
    },
    clearDownloadSelection: () => set({ downloadStations: [] }),
    pruneDownloadSelection: (availableStations) =>
      set((state) => {
        const available = new Map(
          availableStations.map((station) => [station.id, station]),
        );
        const next = state.downloadStations
          .filter(({ id }) => available.has(id))
          .map(({ id }) => available.get(id));
        return next.length === state.downloadStations.length &&
          next.every(
            (station, index) => station === state.downloadStations[index],
          )
          ? state
          : { downloadStations: next };
      }),

    stations: [],
    setStations: (stations) => {
      set({ stations: stations });
    },

    variables: [],
    setVariables: (variables) => {
      set({ variables: variables });
    },

    resetStationFilters: (
      scope,
      { networks = [], variables = [], frequencies = [] } = {},
    ) =>
      set((state) => {
        const reset = {};
        if (scope === "all" || scope === "networks") {
          reset.selectedNetworks = networks
            .filter(({ publish }) => publish !== false)
            .map(({ uri }) => uri);
          reset.defaultNetworksApplied = true;
        }
        if (scope === "all" || scope === "variables") {
          reset.selectedVariables = variables.map(({ id }) => id);
          reset.defaultVariablesApplied = true;
        }
        if (scope === "all" || scope === "observations") {
          reset.selectedFrequencies = [...frequencies];
          reset.onlyWithClimatology = false;
          reset.includeStationsWithNoObs = false;
          reset.defaultFrequenciesApplied = true;
        }
        if (scope === "all" || scope === "dates") {
          reset.startDate = null;
          reset.endDate = null;
        }
        if (scope === "all" || scope === "area") reset.area = null;
        if (scope === "all") {
          reset.metadataFilters = { history: [], station: [] };
          reset.metadataSelectedOnly = false;
        } else if (scope === "attributes") {
          const view = state.metadataCompact ? "station" : "history";
          reset.metadataFilters = { ...state.metadataFilters, [view]: [] };
        }
        return reset;
      }),

    // Start of filter options
    startDate: null,
    setStartDate: (date) => {
      set({ startDate: date });
    },

    endDate: null,
    setEndDate: (date) => {
      set({ endDate: date });
    },

    includeStationsWithNoObs: false,
    toggleIncludeStationsWithNoObs: () => {
      set({ includeStationsWithNoObs: !get().includeStationsWithNoObs });
    },

    onlyWithClimatology: false,
    toggleOnlyWithClimatology: () => {
      set({ onlyWithClimatology: !get().onlyWithClimatology });
    },

    // actual selected options
    selectedNetworks: [],
    defaultNetworksApplied: false,
    setSelectedNetworks: (selectedNetworks) => {
      set({ selectedNetworks: selectedNetworks });
    },
    setDefaultNetworks: (defaultNetworks) => {
      if (get().defaultNetworksApplied) return;
      set({ selectedNetworks: defaultNetworks, defaultNetworksApplied: true });
    },

    selectedVariables: [],
    defaultVariablesApplied: false,
    setSelectedVariables: (selectedVariables) => {
      set({ selectedVariables: selectedVariables });
    },
    setDefaultVariables: (defaultVariables) => {
      if (get().defaultVariablesApplied) return;
      set({
        selectedVariables: defaultVariables,
        defaultVariablesApplied: true,
      });
    },

    selectedFrequencies: [],
    defaultFrequenciesApplied: false,
    setSelectedFrequencies: (selectedFrequencies) => {
      set({ selectedFrequencies: selectedFrequencies });
    },
    setDefaultFrequencies: (defaultFrequencies) => {
      if (get().defaultFrequenciesApplied) return;
      set({
        selectedFrequencies: defaultFrequencies,
        defaultFrequenciesApplied: true,
      });
    },

    // Map polygon, used for selecting (not filtering) stations.
    area: null,

    setArea: (area) => {
      set({ area: area });
    },
  })),
);
