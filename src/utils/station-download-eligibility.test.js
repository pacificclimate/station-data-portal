import { expect, it } from "vitest";
import { stationDownloadConflicts } from "./station-download-eligibility";

const ring = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 10],
  [0, 0],
];
const area = { type: "MultiPolygon", coordinates: [[ring]] };
const history = (props = {}) => ({
  lat: 5,
  lon: 5,
  variable_ids: [1],
  freq: "daily",
  min_obs_time: new Date("2000-01-01"),
  max_obs_time: new Date("2020-12-31"),
  ...props,
});
const station = (props = {}) => ({
  id: 37,
  network_uri: "/networks/1",
  histories: [history()],
  ...props,
});
const filters = {
  selectedNetworks: ["/networks/1"],
  selectedVariables: [1, 2],
  selectedFrequencies: ["daily"],
  includeStationsWithNoObs: false,
  onlyWithClimatology: false,
  startDate: null,
  endDate: null,
  area,
};
const variables = [
  { id: 1, tags: [] },
  { id: 2, tags: ["climatology"] },
];
const conflicts = (stations, changes = {}) =>
  stationDownloadConflicts(stations, { ...filters, ...changes }, variables);
it("blocks stations outside the area and never silently reduces a mixed requested set", () => {
  const outside = station({ id: 42, histories: [history({ lon: 20 })] });
  expect(conflicts([station()])).toEqual([]);
  expect(conflicts([station(), outside])).toEqual([
    {
      station: outside,
      reason: expect.stringMatching(/Outside the current drawn area/),
    },
  ]);
  expect(conflicts([outside], { area: null })).toEqual([]);
});
it.each([
  [0, 5],
  [10, 5],
  [5, 0],
  [5, 10],
  [0, 0],
  [10, 10],
])("includes stations on an area boundary (%s, %s)", (lon, lat) => {
  expect(conflicts([station({ histories: [history({ lon, lat })] })])).toEqual(
    [],
  );
});
it("excludes the interior of holes but includes their boundaries", () => {
  const hole = [
    [4, 4],
    [6, 4],
    [6, 6],
    [4, 6],
    [4, 4],
  ];
  const polygon = { type: "MultiPolygon", coordinates: [[ring, hole]] };
  expect(conflicts([station()], { area: polygon })).toHaveLength(1);
  expect(
    conflicts([station({ histories: [history({ lon: 4 })] })], {
      area: polygon,
    }),
  ).toEqual([]);
});
it("accepts a matching location in another polygon or history", () => {
  const polygon = {
    type: "MultiPolygon",
    coordinates: [
      [
        [
          [20, 20],
          [30, 20],
          [30, 30],
          [20, 20],
        ],
      ],
      [ring],
    ],
  };
  expect(
    conflicts([station({ histories: [history({ lon: 40 }), history()] })], {
      area: polygon,
    }),
  ).toEqual([]);
});
it.each([
  { selectedNetworks: ["/networks/2"] },
  { selectedVariables: [2] },
  { selectedFrequencies: ["hourly"] },
  { startDate: new Date("2021-01-01") },
  { endDate: new Date("1999-12-31") },
  { onlyWithClimatology: true },
  { startDate: new Date("2020-01-01"), endDate: new Date("2010-01-01") },
])("blocks a station excluded by a supplied criterion: %j", (changes) => {
  expect(conflicts([station()], changes)).toHaveLength(1);
});
it("requires the same history to match both the spatial and date filters", () => {
  const moved = station({
    histories: [
      history({ max_obs_time: new Date("2005-01-01") }),
      history({ lon: 20, min_obs_time: new Date("2010-01-01") }),
    ],
  });
  expect(conflicts([moved], { startDate: new Date("2015-01-01") })).toEqual([
    {
      station: moved,
      reason: expect.stringMatching(/No single station history/),
    },
  ]);
});
it("blocks missing station metadata and invalid IDs", () => {
  expect(conflicts([station({ id: 0 })])).toHaveLength(1);
  expect(conflicts([station({ histories: [] })])).toHaveLength(1);
  expect(conflicts([station({ network_uri: undefined })])).toHaveLength(1);
});
