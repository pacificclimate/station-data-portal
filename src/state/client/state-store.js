import { create } from "zustand";
import { createDebugSlice } from "./slice-debug";
import { createPreviewSlice } from "./slice-preview";
import { devtools } from "zustand/middleware";

export const useStore = create(
  devtools((set, get) => ({
    stationsLimit: null,

    ...createDebugSlice(set, get),
    ...createPreviewSlice(set, get),

    // Actions
    setStationLimit: (limit) => set({ stationsLimit: limit }),
  })),
);

export default useStore;
