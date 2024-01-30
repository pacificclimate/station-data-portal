import { create } from "zustand";
import { createMetadataSlice } from "./slice-metadata";
import { createDebugSlice } from "./slice-debug";

export const useStore = create((set, get) => ({
  ...createMetadataSlice(set, get),
  ...createDebugSlice(set, get),

  // Actions
  initialize: async ({ config }) => {
    set({ stationsLimit: config.stationDebugFetchLimitsOptions[0] });
  },
}));
