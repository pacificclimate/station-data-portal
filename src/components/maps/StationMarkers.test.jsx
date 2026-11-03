import { it, expect } from "vitest";
import { act } from "@testing-library/react";
import { CircleMarker } from "leaflet";
import { useMap } from "react-leaflet";
import React from "react";
import { renderWithProviders } from "@/test-utils";
import { OneStationMarkers, ManyStationMarkers } from "./StationMarkers";
import stations from "@/utils/__test_data__/stations-bc.json";
import networks from "@/utils/__test_data__/networks-bc.json";
import { NETWORKS_QUERY_KEY } from "@/state/query-hooks/use-networks";

const station = stations[0];

it("renders without crashing", () => {
  renderWithProviders(<OneStationMarkers station={station} />, {
    withMap: true,
    // The station's network must resolve: StationTooltip reads `network.name`.
    seedQueries: [[[NETWORKS_QUERY_KEY], networks]],
  });
});

it("resizes existing circles at zoomend without rendering all station components again", () => {
  let leafletMap;
  let historyReads = 0;
  const observed = {
    ...station,
    get histories() {
      historyReads++;
      return station.histories;
    },
  };
  function CaptureMap() {
    leafletMap = useMap();
    return null;
  }
  renderWithProviders(
    <>
      <CaptureMap />
      <ManyStationMarkers
        stations={[observed]}
        zoomToMarkerRadius={(zoom) => zoom}
      />
    </>,
    {
      withMap: true,
      seedQueries: [[[NETWORKS_QUERY_KEY], networks]],
    },
  );
  const circles = [];
  leafletMap.eachLayer((layer) => {
    if (layer instanceof CircleMarker) circles.push(layer);
  });
  expect(circles.length).toBeGreaterThan(0);
  expect(circles.every((layer) => layer.getRadius() === 5)).toBe(true);
  const reads = historyReads;
  act(() => leafletMap.setZoom(6, { animate: false }));
  expect(circles.every((layer) => layer.getRadius() === 6)).toBe(true);
  expect(historyReads).toBe(reads);
  act(() => leafletMap.setZoom(7, { animate: false }));
  expect(circles.every((layer) => layer.getRadius() === 7)).toBe(true);
  expect(historyReads).toBe(reads);
});

it("sizes stations arriving after the viewport is restored using the current zoom", () => {
  let leafletMap;
  let addStations;
  function Driver() {
    leafletMap = useMap();
    const [items, setItems] = React.useState([]);
    addStations = setItems;
    return (
      <ManyStationMarkers
        stations={items}
        zoomToMarkerRadius={(zoom) => zoom}
      />
    );
  }
  renderWithProviders(<Driver />, {
    withMap: true,
    seedQueries: [[[NETWORKS_QUERY_KEY], networks]],
  });
  act(() => leafletMap.setZoom(11, { animate: false }));
  act(() => addStations([station]));
  const circles = [];
  leafletMap.eachLayer((layer) => {
    if (layer instanceof CircleMarker) circles.push(layer);
  });
  expect(circles.length).toBeGreaterThan(0);
  expect(circles.every((layer) => layer.getRadius() === 11)).toBe(true);
});
