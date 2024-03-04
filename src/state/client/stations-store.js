import { stationAreaFilter, stationFilter } from "@/utils/station-filtering";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useStationsStore = create(
  devtools((set, get) => ({
    stations: [],
    setStations: (stations) => {
      set({ stations: stations });
    },

    variables: [],
    setVariables: (variables) => {
      set({ variables: variables });
    },

    filteredStations: [],

    // Start of filter options
    startDate: null,
    setStartDate: (date) => {
      set({ startDate: date });

      get().applyFilter();
    },

    endDate: null,
    setEndDate: (date) => {
      set({ endDate: date });

      get().applyFilter();
    },

    includeStationsWithNoObs: true,
    toggleIncludeStationsWithNoObs: () => {
      set({ includeStationsWithNoObs: !get().includeStationsWithNoObs });

      get().applyFilter();
    },

    onlyWithClimatology: false,
    toggleOnlyWithClimatology: () => {
      set({ onlyWithClimatology: !get().onlyWithClimatology });

      get().applyFilter();
    },

    // actual selected options
    selectedNetworks: [],
    defaultNetworksApplied: false,
    setSelectedNetworks: (selectedNetworks) => {
      set({ selectedNetworks: selectedNetworks });

      get().applyFilter();
    },
    setDefaultNetworks: (defaultNetworks) => {
      if (get().defaultNetworksApplied) return;
      set({ selectedNetworks: defaultNetworks, defaultNetworksApplied: true });
    },

    selectedVariables: [],
    defaultVariablesApplied: false,
    setSelectedVariables: (selectedVariables) => {
      set({ selectedVariables: selectedVariables });

      get().applyFilter();
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

      get().applyFilter();
    },
    setDefaultFrequencies: (defaultFrequencies) => {
      if (get().defaultFrequenciesApplied) return;
      set({
        selectedFrequencies: defaultFrequencies,
        defaultFrequenciesApplied: true,
      });
    },

    // Map polygon, used for selecting (not filtering) stations.
    selectedStations: [],

    area: null,

    setArea: (area) => {
      set({ area: area });

      get().applyAreaFilter();
    },

    applyAreaFilter: () => {
      set({
        selectedStations: stationAreaFilter(get().area, get().filteredStations),
      });
    },

    defaultFilterApplied: false,
    applyDefaultFilter: () => {
      if (get().defaultFilterApplied) return;
      set({ defaultFilterApplied: true });
      get().applyFilter();
    },

    applyFilter: () => {
      console.log("applyFilter");
      set({
        filteredStations: stationFilter({
          filterValues: {
            includeStationsWithNoObs: get().includeStationsWithNoObs,
            startDate: get().startDate,
            endDate: get().endDate,
            selectedNetworks: get().selectedNetworks,
            selectedVariables: get().selectedVariables,
            selectedFrequencies: get().selectedFrequencies,
            onlyWithClimatology: get().onlyWithClimatology,
          },
          metadata: {
            stations: get().stations,
            variables: get().variables,
          },
        }),
      });
      get().applyAreaFilter();
    },
  })),
);
