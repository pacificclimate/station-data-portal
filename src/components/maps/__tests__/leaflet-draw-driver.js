// Drives leaflet-draw's toolbar and handlers the way a user would, with
// synthetic DOM events on the elements leaflet-draw itself listens to. This is
// the only drawing-library-specific part of the drawing test: a replacement
// library supplies a driver with the same five methods.
//
// Points are Leaflet latlngs; `map` is the live L.Map. jsdom has no layout, so
// the map container sits at (0, 0) with size 0 and a container point is also a
// client point.
import { fireEvent } from "@testing-library/react";
import L from "leaflet";

const client = (map, latlng) => {
  const { x, y } = map.latLngToContainerPoint(latlng);
  return { clientX: x, clientY: y, button: 0, which: 1 };
};

// Long enough for L.Draggable's next animation frame, and for leaflet-draw's
// 50 ms pause between polygon vertices.
const nextFrame = () => new Promise((resolve) => setTimeout(resolve, 60));

const container = (map) => map.getContainer();
const click = (map, selector) =>
  fireEvent.click(container(map).querySelector(selector));

// The edit marker sitting on `latlng`, among the markers leaflet-draw adds in
// edit mode.
const editMarkerAt = (map, latlng) => {
  const target = map.latLngToLayerPoint(latlng);
  const markers = [...container(map).querySelectorAll(".leaflet-editing-icon")];
  const marker = markers.find(
    (el) => L.DomUtil.getPosition(el).distanceTo(target) < 1,
  );
  if (!marker) {
    throw new Error(`No edit marker at ${latlng}`);
  }
  return marker;
};

export const leafletDrawDriver = {
  name: "leaflet-draw",

  async drawRectangle(map, [corner, oppositeCorner]) {
    click(map, ".leaflet-draw-draw-rectangle");
    fireEvent.mouseDown(container(map), client(map, corner));
    fireEvent.mouseMove(container(map), client(map, oppositeCorner));
    fireEvent.mouseUp(document.body, client(map, oppositeCorner));
  },

  async drawPolygon(map, vertices) {
    click(map, ".leaflet-draw-draw-polygon");
    for (const vertex of vertices) {
      // Polygon clicks land on the transparent marker covering the map.
      const mouseMarker = container(map).querySelector(".leaflet-mouse-marker");
      fireEvent.mouseMove(mouseMarker, client(map, vertex));
      fireEvent.mouseDown(mouseMarker, client(map, vertex));
      fireEvent.mouseUp(mouseMarker, client(map, vertex));
      // leaflet-draw ignores clicks for 50 ms after adding a vertex.
      await nextFrame();
    }
    click(map, 'a[title="Finish drawing"]');
  },

  async moveVertex(map, from, to) {
    click(map, ".leaflet-draw-edit-edit");
    const marker = editMarkerAt(map, from);
    fireEvent.mouseDown(marker, client(map, from));
    fireEvent.mouseMove(document.body, client(map, to));
    await nextFrame();
    fireEvent.mouseUp(document.body, client(map, to));
    click(map, 'a[title="Save changes"]');
  },

  async deleteShapeAt(map, inside) {
    click(map, ".leaflet-draw-edit-remove");
    // Shapes are painted on the canvas renderer, which hit-tests clicks.
    const canvas = container(map).querySelector(".leaflet-overlay-pane canvas");
    fireEvent.click(canvas, client(map, inside));
    click(map, 'a[title="Save changes"]');
  },

  async deleteAll(map) {
    click(map, ".leaflet-draw-edit-remove");
    click(map, 'a[title="Clear all layers"]');
  },
};
