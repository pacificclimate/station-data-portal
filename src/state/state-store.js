import { create } from "zustand";
import { createDebugSlice } from "./slice-debug";

export const useStore = create((set, get) => ({
  ...createDebugSlice(set, get),

  // Actions
  setStationLimit: (limit) => set({ stationsLimit: limit }),
}));
