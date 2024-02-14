import { create } from "zustand";
import { createDebugSlice } from "./slice-debug";
import { createPreviewSlice } from "./slice-preview";

export const useStore = create((set, get) => ({
  stationsLimit: null,

  ...createDebugSlice(set, get),
  ...createPreviewSlice(set, get),

  // Actions
  setStationLimit: (limit) => set({ stationsLimit: limit }),
}));
