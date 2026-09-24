// Drawing a selection area, through to the stations it selects and the data
// download link. The drawing library is driven through its own toolbar and
// handlers by a small driver; everything after that (StationMap's callbacks,
// the stations store, station filtering, the download URL) is the real app.
import React from "react";
import { screen, waitFor } from "@testing-library/react";
import L from "leaflet";
import { renderWithProviders, testConfig } from "@/test-utils";
import StationMap from "../StationMap";
import StationData from "@/components/info/StationData";
import { StationFilteringProvider } from "@/components/main/Body/StationFilteringProvider";
import { useStationsStore } from "@/state/client/stations-store";
import { STATIONS_QUERY_KEY } from "@/state/query-hooks/use-stations";
import { NETWORKS_QUERY_KEY } from "@/state/query-hooks/use-networks";
import { VARIABLES_QUERY_KEY } from "@/state/query-hooks/use-variables";
import { FREQUENCIES_QUERY_KEY } from "@/state/query-hooks/use-frequencies";
import allStations from "@/utils/__test_data__/stations-bc.json";
import networks from "@/utils/__test_data__/networks-bc.json";
import variables from "@/utils/__test_data__/variables-bc.json";
import frequencies from "@/utils/__test_data__/frequencies-bc.json";
import { geomanDriver } from "./geoman-driver";

vi.hoisted(() => {
  // baseMaps reads the tile URLs from the runtime config at import time.
  window.env = {
    REACT_APP_BC_BASE_MAP_TILES_URL: "https://example.invalid/{z}/{x}/{y}.png",
  };
  // jsdom has no 2D canvas. Leaflet's canvas renderer (the map uses
  // `preferCanvas`) only paints through it, and hit-tests clicks by geometry,
  // so a context that does nothing is enough.
  HTMLCanvasElement.prototype.getContext = function () {
    return new Proxy(
      {},
      {
        get: (target, key) => (key in target ? target[key] : () => {}),
        set: (target, key, value) => ((target[key] = value), true),
      },
    );
  };
});

// Capture the map StationMap creates, so the driver can turn latlngs into
// pointer positions.
let map;
L.Map.addInitHook(function () {
  map = this;
});

// Six EC daily stations in three clusters: Saanich (2, 3, 4), Kamloops
// (275, 276) and Prince George (791).
const stations = allStations.filter(({ id }) =>
  [2, 3, 4, 275, 276, 791].includes(id),
);

const saanichRectangle = [
  [48.4, -123.6],
  [48.7, -123.2],
];
const kamloopsPolygon = [
  [50.6, -120.7],
  [50.75, -120.7],
  [50.72, -120.45],
  [50.6, -120.5],
];
// Dragging the rectangle's north-east corner west leaves Beaver Lake (2, at
// -123.35) outside it.
const saanichCorner = [48.7, -123.2];
const saanichCornerMoved = [48.7, -123.4];
const insideSaanich = [48.55, -123.5];

// Zoom in on the shapes before drawing them, as a user would: at the initial
// zoom the Kamloops polygon spans only a few pixels.
const lookAt = (latlng) => map.setView(latlng, 10, { animate: false });

const selectedCount = () =>
  screen.getByText(/stations selected of/).textContent.match(/^(\d+)/)[1];

// The WKT polygon on the timeseries download link, as a list of polygons.
const downloadPolygons = () => {
  const href = screen
    .getByText("Download Timeseries")
    .closest("a")
    .getAttribute("href");
  const wkt = new URL(href).searchParams.get("input-polygon");
  if (wkt === "") {
    return [];
  }
  expect(wkt).toMatch(/^MULTIPOLYGON \(/);
  return wkt.match(/\(\([^()]*\)\)/g);
};

// The download polygon's vertices, as latlngs.
const downloadPolygonLatLngs = (index) =>
  downloadPolygons()
    [index].replace(/[()]/g, "")
    .split(", ")
    .map((pair) => {
      const [lng, lat] = pair.split(" ").map(Number);
      return L.latLng(lat, lng);
    });

// A rectangle selects a lat/lng box, as leaflet-draw's did: its corners are
// the two dragged-out corners and the other two corners of the lat/lng box
// they span, which the BC map's Albers projection draws as a trapezoid.
// Compared on screen, because clicks land on whole pixels.
const expectLatLngBox = (index, [corner, oppositeCorner]) => {
  const [a, b] = [L.latLng(corner), L.latLng(oppositeCorner)];
  const onScreen = (latlng) => map.latLngToContainerPoint(latlng);
  const expected = [a, [a.lat, b.lng], b, [b.lat, a.lng]].map(onScreen);
  const vertices = downloadPolygonLatLngs(index);
  // Two latitudes and two longitudes, exactly: edges on parallels and
  // meridians, not a box (or a rotated box) on screen.
  const distinct = (key) => new Set(vertices.map((v) => v[key])).size;
  expect([distinct("lat"), distinct("lng")]).toEqual([2, 2]);
  const actual = vertices.map(onScreen);
  for (const point of expected) {
    expect(
      actual.some((vertex) => vertex.distanceTo(point) < 1.5),
      `no vertex at ${point}, got ${actual.join(" ")}`,
    ).toBe(true);
  }
};

const expectSelection = async (count, polygons) => {
  await waitFor(() => expect(selectedCount()).toBe(String(count)));
  expect(downloadPolygons()).toHaveLength(polygons);
};

describe.each([geomanDriver])("drawing with $name", (driver) => {
  beforeEach(() => {
    useStationsStore.setState({
      selectedNetworks: ["/networks/1"],
      selectedVariables: variables.map(({ id }) => id),
      selectedFrequencies: ["daily"],
      area: null,
    });
    renderWithProviders(
      <StationFilteringProvider>
        <StationMap />
        <StationData />
      </StationFilteringProvider>,
      {
        config: {
          ...testConfig,
          zoomToMarkerRadius: () => 2,
          mapSpinner: { spinner: "Bars" },
          maxUrlLength: 2047,
        },
        seedQueries: [
          [[STATIONS_QUERY_KEY], stations],
          [[NETWORKS_QUERY_KEY], networks],
          [VARIABLES_QUERY_KEY, variables],
          [FREQUENCIES_QUERY_KEY, frequencies],
        ],
      },
    );
  });

  it("selects stations and sets the download polygon as shapes change", async () => {
    await expectSelection(6, 0);

    lookAt(insideSaanich);
    await driver.drawRectangle(map, saanichRectangle);
    await expectSelection(3, 1);
    expectLatLngBox(0, saanichRectangle);

    lookAt(kamloopsPolygon[0]);
    await driver.drawPolygon(map, kamloopsPolygon);
    await expectSelection(5, 2);

    lookAt(insideSaanich);
    await driver.moveVertex(map, saanichCorner, saanichCornerMoved);
    await expectSelection(4, 2);
    expectLatLngBox(0, [saanichRectangle[0], saanichCornerMoved]);

    await driver.deleteShapeAt(map, insideSaanich);
    await expectSelection(2, 1);

    await driver.deleteAll(map);
    await expectSelection(6, 0);
  });
});
