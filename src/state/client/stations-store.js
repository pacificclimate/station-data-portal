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

    // Start of filter options
    startDate: null,
    setStartDate: (date) => {
      set({ startDate: date });
    },

    endDate: null,
    setEndDate: (date) => {
      set({ endDate: date });
    },

    includeStationsWithNoObs: true,
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
