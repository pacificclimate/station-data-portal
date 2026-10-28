import { textAttributeIds } from "@/utils/text-filter-terms";
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
];
const snapshot = () =>
  Object.fromEntries(
    fields.map((key) => [key, useStationsStore.getState()[key]]),
  );
const attributeIds = new Set([
  "Native ID",
  "Station name",
  "Province",
  "Elevation",
  "Unique Names",
  "# Hx",
]);

// URL data is untrusted: accept only supported filter fields and value types.
export function decodeWorkspaceFilters(value) {
  if (!value || value.length > 50000) return null;
  try {
    const parsed = JSON.parse(value);
    const result = {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return null;
    for (const key of ["startDate", "endDate"]) {
      if (parsed[key] === null) result[key] = null;
      else if (
        typeof parsed[key] === "string" &&
        Number.isFinite(Date.parse(parsed[key]))
      )
        result[key] = new Date(parsed[key]);
    }
    for (const key of [
      "includeStationsWithNoObs",
      "onlyWithClimatology",
      "metadataCompact",
    ]) {
      if (typeof parsed[key] === "boolean") result[key] = parsed[key];
    }
    for (const key of [
      "selectedNetworks",
      "selectedVariables",
      "selectedFrequencies",
    ]) {
      if (
        Array.isArray(parsed[key]) &&
        parsed[key].length <= 10000 &&
        parsed[key].every(
          (item) => typeof item === "string" || typeof item === "number",
        )
      )
        result[key] = parsed[key];
    }
    if (parsed.metadataFilters && typeof parsed.metadataFilters === "object") {
      result.metadataFilters = Object.fromEntries(
        ["history", "station"].map((view) => [
          view,
          Array.isArray(parsed.metadataFilters[view])
            ? parsed.metadataFilters[view].filter(
                (filter) =>
                  filter &&
                  attributeIds.has(filter.id) &&
                  (["Elevation", "# Hx"].includes(filter.id)
                    ? Array.isArray(filter.value) &&
                      filter.value.length === 2 &&
                      filter.value.every(
                        (item) => item == null || Number.isFinite(item),
                      )
                    : typeof filter.value === "string" ||
                      (textAttributeIds.has(filter.id) &&
                        Array.isArray(filter.value) &&
                        filter.value.every(
                          (term) => typeof term === "string",
                        ))),
              )
            : [],
        ]),
      );
    }
    if (result.selectedNetworks) result.defaultNetworksApplied = true;
    if (result.selectedVariables) result.defaultVariablesApplied = true;
    if (result.selectedFrequencies) result.defaultFrequenciesApplied = true;
    return result;
  } catch {
    return null;
  }
}

export function useWorkspaceUrlState() {
  const location = useLocation();
  const navigate = useNavigate();
  useLayoutEffect(() => {
    const params = new URLSearchParams(location.search);
    const restored = decodeWorkspaceFilters(params.get("criteria"));
    if (restored && params.get("criteria") !== JSON.stringify(snapshot()))
      useStationsStore.setState(restored);
    const writeFilters = () => {
      const state = useStationsStore.getState();
      if (
        !params.has("criteria") &&
        !(
          state.defaultNetworksApplied &&
          state.defaultVariablesApplied &&
          state.defaultFrequenciesApplied
        )
      )
        return;
      const serialized = JSON.stringify(snapshot());
      if (params.get("criteria") === serialized) return;
      params.set("criteria", serialized);
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
