import { textAttributeIds } from "./text-filter-terms";

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
    if ("area" in parsed) {
      if (!validArea(parsed.area)) return null;
      result.area = parsed.area;
    }
    if ("mapViewport" in parsed) {
      if (!validViewport(parsed.mapViewport)) return null;
      result.mapViewport = parsed.mapViewport;
    }
    if (result.selectedNetworks) result.defaultNetworksApplied = true;
    if (result.selectedVariables) result.defaultVariablesApplied = true;
    if (result.selectedFrequencies) result.defaultFrequenciesApplied = true;
    return result;
  } catch {
    return null;
  }
}

// Versioned, short keys reduce query length before URL-safe UTF-8 encoding.
// This is encoding, not encryption; shared links contain the user's filters.
const keys = {
  selectedNetworks: "n",
  selectedVariables: "v",
  selectedFrequencies: "f",
  startDate: "s",
  endDate: "e",
  includeStationsWithNoObs: "o",
  onlyWithClimatology: "c",
  metadataCompact: "g",
  area: "p",
  mapViewport: "m",
};
const attributes = [...attributeIds];

export function validViewport(value) {
  return (
    value === null ||
    (Array.isArray(value) &&
      value.length === 3 &&
      value.every(Number.isFinite) &&
      Math.abs(value[0]) <= 90 &&
      Math.abs(value[1]) <= 180 &&
      value[2] >= 0 &&
      value[2] <= 18)
  );
}

export function validArea(area) {
  if (area == null) return true;
  if (
    area.type !== "MultiPolygon" ||
    !Array.isArray(area.coordinates) ||
    !area.coordinates.length ||
    area.coordinates.length > 100
  )
    return false;
  let points = 0;
  return area.coordinates.every(
    (polygon) =>
      Array.isArray(polygon) &&
      polygon.length > 0 &&
      polygon.length <= 100 &&
      polygon.every((ring) => {
        if (
          !Array.isArray(ring) ||
          ring.length < 4 ||
          (points += ring.length) > 2000
        )
          return false;
        if (
          !ring.every(
            (point) =>
              Array.isArray(point) &&
              point.length === 2 &&
              point.every(Number.isFinite) &&
              Math.abs(point[0]) <= 180 &&
              Math.abs(point[1]) <= 90,
          )
        )
          return false;
        return ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1];
      }),
  );
}

export function encodeWorkspaceView(state) {
  const compact = {};
  for (const [field, key] of Object.entries(keys)) {
    const value = state[field];
    if (value == null || value === false) continue;
    compact[key] =
      field === "area" ? value.coordinates : value === true ? 1 : value;
  }
  if (
    state.metadataFilters &&
    Object.values(state.metadataFilters).some((filters) => filters.length)
  )
    compact.a = ["history", "station"].map((view) =>
      state.metadataFilters[view].map(({ id, value }) => [
        attributes.indexOf(id),
        value,
      ]),
    );
  const bytes = new TextEncoder().encode(JSON.stringify(compact));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return (
    "1." +
    btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "")
  );
}

export function decodeWorkspaceView(value) {
  if (!value || value.length > 70000 || !/^1\.[A-Za-z0-9_-]+$/.test(value))
    return null;
  try {
    const binary = atob(
      value.slice(2).replaceAll("-", "+").replaceAll("_", "/"),
    );
    const compact = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(
        Uint8Array.from(binary, (character) => character.charCodeAt(0)),
      ),
    );
    if (!compact || typeof compact !== "object" || Array.isArray(compact))
      return null;
    const restored = {
      startDate: null,
      endDate: null,
      includeStationsWithNoObs: false,
      onlyWithClimatology: false,
      metadataCompact: false,
      metadataFilters: { history: [], station: [] },
      area: null,
      mapViewport: null,
    };
    for (const [field, key] of Object.entries(keys)) {
      if (!(key in compact)) continue;
      const v = compact[key];
      restored[field] =
        field === "area"
          ? { type: "MultiPolygon", coordinates: v }
          : ["o", "c", "g"].includes(key)
            ? v === 1
            : v;
    }
    if (compact.a) {
      if (!Array.isArray(compact.a) || compact.a.length !== 2) return null;
      restored.metadataFilters = Object.fromEntries(
        ["history", "station"].map((view, i) => [
          view,
          compact.a[i].map(([id, value]) => ({ id: attributes[id], value })),
        ]),
      );
    }
    return decodeWorkspaceFilters(JSON.stringify(restored));
  } catch {
    return null;
  }
}
