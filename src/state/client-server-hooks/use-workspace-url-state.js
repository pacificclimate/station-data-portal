import {
  decodeWorkspaceFilters,
  decodeWorkspaceView,
  encodeWorkspaceView,
} from "@/utils/workspace-url";
export { decodeWorkspaceFilters } from "@/utils/workspace-url";
import { useLayoutEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStationsStore } from "@/state/client/stations-store";

const fields = [
  "startDate",
  "endDate",
  "includeStationsWithNoObs",
  "onlyWithClimatology",
  "selectedNetworks",
  "selectedVariables",
  "selectedFrequencies",
  "metadataCompact",
  "metadataFilters",
  "area",
  "mapViewport",
];
const snapshot = () =>
  Object.fromEntries(
    fields.map((key) => [key, useStationsStore.getState()[key]]),
  );
export function useWorkspaceUrlState() {
  const location = useLocation();
  const navigate = useNavigate();
  useLayoutEffect(() => {
    const params = new URLSearchParams(location.search);
    const restored = params.has("view")
      ? decodeWorkspaceView(params.get("view"))
      : decodeWorkspaceFilters(params.get("criteria"));
    if (restored) {
      const state = useStationsStore.getState();
      const changes = Object.fromEntries(
        Object.entries(restored).filter(([key, value]) =>
          key === "area"
            ? JSON.stringify(state.area?.coordinates ?? null) !==
              JSON.stringify(value?.coordinates ?? null)
            : JSON.stringify(state[key]) !== JSON.stringify(value),
        ),
      );
      if (Object.keys(changes).length) useStationsStore.setState(changes);
    }
    const writeFilters = () => {
      const state = useStationsStore.getState();
      if (
        !params.has("view") &&
        !params.has("criteria") &&
        !(
          state.defaultNetworksApplied &&
          state.defaultVariablesApplied &&
          state.defaultFrequenciesApplied
        )
      )
        return;
      const serialized = encodeWorkspaceView(snapshot());
      if (params.get("view") === serialized && !params.has("criteria")) return;
      params.delete("criteria");
      params.set("view", serialized);
      navigate(
        { search: params.toString() },
        { replace: true, preventScrollReset: true, state: location.state },
      );
    };
    const unsubscribe = useStationsStore.subscribe((state, previous) => {
      if (fields.some((field) => state[field] !== previous[field]))
        writeFilters();
    });
    // Publish once as well, so copying a URL before editing preserves current filters.
    writeFilters();
    return unsubscribe;
  }, [location.search, navigate]);

  const params = new URLSearchParams(location.search);
  const setPanel = useCallback(
    (name, open) => {
      const next = new URLSearchParams(location.search);
      if (open) next.set(name, "1");
      else next.delete(name);
      if (name === "table" && open) next.delete("filters");
      navigate(
        { search: next.toString() },
        { preventScrollReset: true, state: location.state },
      );
    },
    [location.search, navigate],
  );
  return {
    tableOpen: params.get("table") === "1",
    filtersOpen: params.get("filters") === "1",
    legendOpen: params.get("networks") === "1",
    setTableOpen: (open) => setPanel("table", open),
    setFiltersOpen: (open) => setPanel("filters", open),
    setLegendOpen: (open) => setPanel("networks", open),
  };
}
