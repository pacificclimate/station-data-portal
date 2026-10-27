import { expect, it } from "vitest";
import {
  stationCriteriaSummary,
  activeAttributeFilters,
} from "./station-filter-summary";
const catalogs = {
  networks: [{ uri: "EC" }, { uri: "OTHER" }],
  variables: [{ id: 1 }, { id: 2 }],
  frequencies: ["daily", "1-hourly"],
};
const defaults = {
  selectedNetworks: ["EC", "OTHER"],
  selectedVariables: [1, 2],
  selectedFrequencies: ["daily", "1-hourly"],
  startDate: null,
  endDate: null,
  onlyWithClimatology: false,
  includeStationsWithNoObs: false,
  area: null,
};
it("does not count All, selection order or duplicates as restrictions", () => {
  expect(stationCriteriaSummary(defaults, catalogs)).toEqual([]);
  expect(
    stationCriteriaSummary(
      { ...defaults, selectedNetworks: ["OTHER", "EC", "EC"] },
      catalogs,
    ),
  ).toEqual([]);
});
it("counts criteria independently of table view, including empty multiselections", () => {
  const state = {
    ...defaults,
    selectedNetworks: ["EC"],
    selectedVariables: [],
    selectedFrequencies: ["daily"],
  };
  expect(stationCriteriaSummary(state, catalogs)).toEqual([
    "Networks",
    "Variables",
    "Observation frequency",
  ]);
});
it("includes date bounds, climatology, observation options and drawn area", () => {
  expect(
    stationCriteriaSummary(
      {
        ...defaults,
        startDate: new Date(2000, 0, 1),
        endDate: new Date(2010, 0, 1),
        onlyWithClimatology: true,
        includeStationsWithNoObs: true,
        area: { type: "MultiPolygon", coordinates: [[[]]] },
      },
      catalogs,
    ),
  ).toEqual([
    "Start date",
    "End date",
    "Only with climatology",
    "Include stations with no observations",
    "Spatial area",
  ]);
});
it("does not invent subset counts before options have loaded", () => {
  expect(stationCriteriaSummary(defaults, {})).toEqual([]);
});
it("ignores All and empty attribute ranges but counts zero-valued bounds", () => {
  expect(
    activeAttributeFilters([
      { id: "Province", value: "*" },
      { id: "Station name", value: "" },
      { id: "Elevation", value: [null, null] },
      { id: "Elevation", value: ["", undefined] },
      { id: "Elevation", value: [0, null] },
      { id: "Native ID", value: "N1" },
    ]),
  ).toEqual([
    { id: "Elevation", value: [0, null] },
    { id: "Native ID", value: "N1" },
  ]);
});

it("does not count unselectable networks as missing from All", () => {
  const metadata = {
    ...catalogs,
    networks: [...catalogs.networks, { uri: "HIDDEN", publish: false }],
  };
  expect(stationCriteriaSummary(defaults, metadata)).toEqual([]);
  expect(
    stationCriteriaSummary(
      {
        ...defaults,
        selectedNetworks: [...defaults.selectedNetworks, "HIDDEN"],
      },
      metadata,
    ),
  ).toEqual([]);
});

it("counts multiple text alternatives as one field constraint and ignores empty lists", () => {
  expect(
    activeAttributeFilters([
      { id: "Station name", value: ["st", "pl", "rd"] },
      { id: "Native ID", value: ["", " "] },
      { id: "Unique Names", value: [] },
      { id: "Province", value: "*" },
    ]),
  ).toEqual([{ id: "Station name", value: ["st", "pl", "rd"] }]);
  expect(
    activeAttributeFilters([{ id: "Native ID", value: ["*"] }]),
  ).toHaveLength(1);
});
