import React from "react";
import { act, render } from "@testing-library/react";
import { beforeEach, expect, it } from "vitest";
import { BCBaseMap } from "pcic-react-leaflet-components";
import { useMap } from "react-leaflet";
import { useStationsStore } from "@/state/client/stations-store";
import StationBaseMap from "./StationBaseMap";
import MapUrlViewport from "./MapUrlViewport";

beforeEach(() =>
  useStationsStore.setState({ mapViewport: [48.43, -123.37, 16] }),
);
it("restores a shared viewport, publishes panning and zooming, and responds to browser restoration", () => {
  let map;
  function CaptureMap() {
    map = useMap();
    return null;
  }
  render(
    <StationBaseMap
      baseMap={BCBaseMap}
      baseMapTilesUrl="https://example.invalid/{z}/{x}/{y}.png"
      center={[55, -125]}
      zoom={6}
      minZoom={6}
      maxZoom={18}
      zoomAnimation={false}
    >
      <CaptureMap />
      <MapUrlViewport />
    </StationBaseMap>,
  );
  expect(map.getCenter().lat).toBeCloseTo(48.43, 5);
  expect(map.getCenter().lng).toBeCloseTo(-123.37, 5);
  expect(map.getZoom()).toBe(16);
  act(() => map.setView([49.25, -123.1], 17, { animate: false }));
  expect(useStationsStore.getState().mapViewport).toEqual([49.25, -123.1, 17]);
  act(() => useStationsStore.getState().setMapViewport([50.5, -120.5, 8]));
  expect(map.getCenter().lat).toBeCloseTo(50.5, 5);
  expect(map.getZoom()).toBe(8);
});
it("clamps a shared zoom to the regional minimum", () => {
  useStationsStore.setState({ mapViewport: [50, -125, 0] });
  let map;
  function CaptureMap() {
    map = useMap();
    return null;
  }
  render(
    <StationBaseMap
      baseMap={BCBaseMap}
      baseMapTilesUrl="https://example.invalid/{z}/{x}/{y}.png"
      center={[55, -125]}
      zoom={6}
      minZoom={6}
      maxZoom={18}
    >
      <CaptureMap />
      <MapUrlViewport />
    </StationBaseMap>,
  );
  expect(map.getZoom()).toBe(6);
  expect(useStationsStore.getState().mapViewport[2]).toBe(6);
});
