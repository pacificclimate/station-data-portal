// Drives Leaflet-Geoman's toolbar and handlers the way a user would, with
// synthetic DOM events on the elements Geoman itself listens to. This is the
// only drawing-library-specific part of the drawing test: a replacement
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

// Long enough for L.Draggable's next animation frame.
const nextFrame = () => new Promise((resolve) => setTimeout(resolve, 60));

const container = (map) => map.getContainer();
const clickButton = (map, icon) =>
  fireEvent.click(container(map).querySelector(`.leaflet-pm-icon-${icon}`));
// An action ("Finish", "Clear all", …) of the toolbar button that's active.
const clickAction = (map, name) =>
  fireEvent.click(
    container(map).querySelector(`.button-container.active .action-${name}`),
  );

// Geoman draws with clicks on the map, not presses and drags.
const clickMapAt = (map, latlng) => {
  fireEvent.mouseMove(container(map), client(map, latlng));
  fireEvent.click(container(map), client(map, latlng));
};

// The vertex marker sitting on `latlng`, among those Geoman adds in edit mode.
const vertexMarkerAt = (map, latlng) => {
  const target = map.latLngToLayerPoint(latlng);
  const markers = [
    ...container(map).querySelectorAll(
      ".leaflet-marker-pane .marker-icon:not(.marker-icon-middle)",
    ),
  ];
  const marker = markers.find(
    (el) => L.DomUtil.getPosition(el).distanceTo(target) < 1,
  );
  if (!marker) {
    throw new Error(`No vertex marker at ${latlng}`);
  }
  return marker;
};

export const geomanDriver = {
  name: "Leaflet-Geoman",

  async drawRectangle(map, [corner, oppositeCorner]) {
    clickButton(map, "rectangle");
    clickMapAt(map, corner);
    clickMapAt(map, oppositeCorner);
  },

  async drawPolygon(map, vertices) {
    clickButton(map, "polygon");
    for (const vertex of vertices) {
      clickMapAt(map, vertex);
    }
    clickAction(map, "finish");
  },

  async moveVertex(map, from, to) {
    clickButton(map, "edit");
    const marker = vertexMarkerAt(map, from);
    fireEvent.mouseDown(marker, client(map, from));
    fireEvent.mouseMove(document.body, client(map, to));
    await nextFrame();
    fireEvent.mouseUp(document.body, client(map, to));
    clickAction(map, "finishMode");
  },

  async deleteShapeAt(map, inside) {
    clickButton(map, "delete");
    // Shapes are painted on the canvas renderer, which hit-tests clicks.
    const canvas = container(map).querySelector(".leaflet-overlay-pane canvas");
    fireEvent.click(canvas, client(map, inside));
    clickAction(map, "finishMode");
  },

  async deleteAll(map) {
    clickButton(map, "delete");
    clickAction(map, "clearAll");
  },
};
