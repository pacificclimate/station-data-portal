import { expect, it } from "vitest";
import frequencies from "./__test_data__/frequencies-bc.json";
import {
  encodeWorkspaceView,
  decodeWorkspaceView,
  decodeWorkspaceFilters,
  validArea,
} from "./workspace-url";

const area = {
  type: "MultiPolygon",
  coordinates: [
    [
      [
        [-124, 48],
        [-123, 48],
        [-123, 49],
        [-124, 49],
        [-124, 48],
      ],
      [
        [-123.8, 48.2],
        [-123.5, 48.2],
        [-123.5, 48.5],
        [-123.8, 48.2],
      ],
    ],
    [
      [
        [-120, 50],
        [-119, 50],
        [-119, 51],
        [-120, 50],
      ],
    ],
  ],
};
it("encodes Unicode filters, holes and multiple polygons in a smaller URL-safe snapshot", () => {
  const state = {
    selectedNetworks: ["/networks/1", "/networks/2"],
    selectedVariables: [1, 2, 3],
    selectedFrequencies: ["daily"],
    startDate: new Date("2001-01-01T00:00:00Z"),
    endDate: null,
    metadataCompact: true,
    includeStationsWithNoObs: false,
    onlyWithClimatology: true,
    metadataFilters: {
      history: [{ id: "Elevation", value: [100, null] }],
      station: [{ id: "Unique Names", value: ["Rivière", "温度"] }],
    },
    area,
    mapViewport: [48.5, -123.5, 17],
  };
  const encoded = encodeWorkspaceView(state);
  expect(encoded).toMatch(/^1\.[A-Za-z0-9_-]+$/);
  expect(decodeWorkspaceView(encoded)).toMatchObject(state);
  expect(encoded.length).toBeLessThan(
    encodeURIComponent(JSON.stringify(state)).length,
  );
});
it("restores omitted defaults so Back can clear a former spatial filter", () => {
  expect(
    decodeWorkspaceView(
      encodeWorkspaceView({
        selectedNetworks: [],
        selectedVariables: [],
        selectedFrequencies: [],
      }),
    ),
  ).toMatchObject({
    area: null,
    mapViewport: null,
    metadataCompact: false,
    metadataFilters: { history: [], station: [] },
    startDate: null,
    endDate: null,
  });
});
it("rejects invalid geometry, non-finite coordinates, oversized rings and unsupported versions", () => {
  for (const value of [
    "not-encoded",
    "2.abc",
    "1.%%%",
    "1." + "a".repeat(70000),
  ])
    expect(decodeWorkspaceView(value)).toBeNull();
  for (const invalid of [
    { type: "Polygon", coordinates: [] },
    { type: "MultiPolygon", coordinates: [] },
    {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [0, 0],
            [1, 1],
            [2, 2],
            [3, 3],
          ],
        ],
      ],
    },
    {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [0, 0],
            [181, 1],
            [1, 1],
            [0, 0],
          ],
        ],
      ],
    },
    {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [0, 0],
            [1, 91],
            [1, 1],
            [0, 0],
          ],
        ],
      ],
    },
    { type: "MultiPolygon", coordinates: [[[...Array(2001).fill([0, 0])]]] },
  ]) {
    expect(validArea(invalid)).toBe(false);
    expect(
      decodeWorkspaceFilters(JSON.stringify({ area: invalid })),
    ).toBeNull();
  }
  expect(decodeWorkspaceFilters('{"mapViewport":[50,-125,99]}')).toBeNull();
});

it("round-trips unspecified observation frequency without accepting null selector IDs", () => {
  expect(
    decodeWorkspaceView(
      encodeWorkspaceView({ selectedFrequencies: frequencies }),
    ),
  ).toMatchObject({
    selectedFrequencies: frequencies,
    defaultFrequenciesApplied: true,
  });
  expect(
    decodeWorkspaceFilters(
      JSON.stringify({
        selectedNetworks: [null],
        selectedVariables: [null],
        selectedFrequencies: [null],
      }),
    ),
  ).toEqual({ selectedFrequencies: [null], defaultFrequenciesApplied: true });
});

it("compacts consecutive variable IDs and network references without losing order", () => {
  const state = {
    selectedNetworks: ["/networks/1", "/networks/72"],
    selectedVariables: [427, 428, 429, 430, 7, 9, 8, 8],
    selectedFrequencies: [null, "daily"],
    openStationId: 37,
    downloadStations: [{ id: 42 }],
    metadataSelectedOnly: true,
  };
  const encoded = encodeWorkspaceView(state);
  const compact = JSON.parse(
    atob(encoded.slice(2).replaceAll("-", "+").replaceAll("_", "/")),
  );
  expect(compact.n).toEqual([1, 72]);
  expect(compact.v).toEqual([[427, 430], 7, 9, 8, 8]);
  const restored = decodeWorkspaceView(encoded);
  expect(restored).toMatchObject({
    selectedNetworks: state.selectedNetworks,
    selectedVariables: state.selectedVariables,
    selectedFrequencies: state.selectedFrequencies,
    openStationId: 37,
  });
  expect(restored).not.toHaveProperty("downloadStations");
  expect(restored).not.toHaveProperty("metadataSelectedOnly");
});

it.each([
  { ranges: [[1, 1000000000]] },
  { ranges: [[8, 2]] },
  { ranges: [[1, 2, 3]] },
  { ranges: [[-1, 3]] },
])("rejects invalid or oversized ID ranges $ranges", ({ ranges }) => {
  const encoded =
    "1." +
    btoa(JSON.stringify({ v: ranges }))
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replace(/=+$/, "");
  expect(decodeWorkspaceView(encoded)).toBeNull();
});
