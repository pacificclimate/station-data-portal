import React from "react";
import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { BCBaseMap, YNWTBaseMap } from "pcic-react-leaflet-components";
import StationBaseMap from "./StationBaseMap";

it.each([
  ["BC", BCBaseMap, [48.43, -123.37]],
  ["YNWT", YNWTBaseMap, [60.72, -135.05]],
])(
  "overzooms %s without requesting unavailable tiles or losing projected coordinates",
  (_, baseMap, center) => {
    let map;
    function CaptureMap() {
      map = useMap();
      return null;
    }
    const { unmount } = render(
      <StationBaseMap
        baseMap={baseMap}
        baseMapTilesUrl="https://example.invalid/{z}/{x}/{y}.webp"
        center={center}
        zoom={18}
        maxZoom={18}
        zoomAnimation={false}
      >
        <CaptureMap />
      </StationBaseMap>,
    );
    expect(map.getZoom()).toBe(18);
    const location = L.latLng(center);
    const point = map.project(location, 18);
    expect(Number.isFinite(point.x)).toBe(true);
    expect(Number.isFinite(point.y)).toBe(true);
    const restored = map.unproject(point, 18);
    expect(restored.lat).toBeCloseTo(location.lat, 6);
    expect(restored.lng).toBeCloseTo(location.lng, 6);
    const tiles = [];
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) tiles.push(layer);
    });
    expect(tiles).toHaveLength(1);
    const images = Object.values(tiles[0]._tiles);
    expect(images.length).toBeGreaterThan(0);
    for (const { coords, el } of images) {
      expect(coords.z).toBe(13);
      expect(el.src).toContain("/13/");
    }
    unmount();
  },
);
