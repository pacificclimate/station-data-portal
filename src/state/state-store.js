import { create } from "zustand";
import { createConfigSlice } from "./slice-config";
import { createMetadataSlice } from "./slice-metadata";
import { createDebugSlice } from "./slice-debug";

export const useStore = create((set, get) => ({
  ...createConfigSlice(set, get),
  ...createMetadataSlice(set, get),
  ...createDebugSlice(set, get),

  // Actions
  initialize: async () => {
    await get()._loadConfig();
    set({ stationsLimit: get().config.stationDebugFetchLimitsOptions[0] });
  },
}));
