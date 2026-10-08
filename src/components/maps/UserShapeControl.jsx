// A map toolbar, built on Leaflet-Geoman, for drawing, editing and deleting
// the user's selection shapes.
//
// The shapes are plain Leaflet polygons (rectangles are polygons too). After
// every create, edit or delete, `onChange` receives all of them as an array of
// layers, so the caller never deals with the drawing library.
//
// Geoman runs opt-in: it ignores every layer, the map included, unless the
// layer has `pmIgnore: false`. That keeps its edit and delete modes off the
// station markers, and spares it from setting up thousands of them. The map
// therefore needs `pmIgnore={false}`.
//
// A selection's edges are straight in lon/lat, which is what the station
// filter and the backend select, so the shapes, and Geoman's previews of them,
// are drawn with `lonLatEdges` (see ./lonLatEdges).
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "./lonLatEdges";

L.PM.setOptIn(true);

// Keep rectangles as lat/lng boxes (on the BC map's Albers projection, curved
// top and bottom edges between straight, converging sides). Geoman works out
// every rectangle's corners here (while drawing, and when a corner is dragged
// in edit mode) as a box on screen, then creates the finished rectangle as a
// lat/lng box, so without this the shape jumps on release. The angle is ignored: rotate mode is off, and in edit mode Geoman
// infers one from the first edge, a meridian that Albers draws tilted.
L.PM.Utils._getRotatedRectangle = (A, B) => {
  const [a, b] = [L.latLng(A), L.latLng(B)];
  return [a, L.latLng(a.lat, b.lng), b, L.latLng(b.lat, a.lng)];
};

const UserShapeControl = ({ position = "topleft", shapeStyle, onChange }) => {
  const map = useMap();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const shapes = L.featureGroup().addTo(map);
    const report = () => onChangeRef.current(shapes.getLayers());

    const style = { ...shapeStyle, lonLatEdges: true, interactive: false };
    map.pm.setGlobalOptions({
      layerGroup: shapes,
      pathOptions: { ...style, pmIgnore: false },
      templineStyle: style,
      hintlineStyle: { ...style, dashArray: [5, 5] },
      snapSegment: false,
    });
    map.pm.addControls({
      position,
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: true,
      drawPolygon: true,
      drawCircle: false,
      drawText: false,
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: true,
      rotateMode: false,
    });
    // Delete mode also offers "Clear all", which removes every shape.
    map.pm.Toolbar.changeActionsOfControl("removalMode", [
      "finishMode",
      {
        name: "clearAll",
        text: "Clear all",
        onClick: () => {
          shapes.clearLayers();
          map.pm.disableGlobalRemovalMode();
          report();
        },
      },
    ]);

    const onCreate = ({ layer }) => {
      // push shapes back so that station pins are on top, clickable and with
      // no discolouration from the selection. Newest first, so the shapes
      // keep their stacking order: the newest on top, removed first.
      shapes
        .getLayers()
        .reverse()
        .forEach((shape) => shape.bringToBack());
      layer.on("pm:edit", report);
      report();
    };
    // Shapes are drawn non-interactive, so the pointer reaches the station
    // markers under them: their tooltips and popups. Delete mode needs to
    // be able to click the shapes
    const onRemovalModeToggled = ({ enabled }) =>
      shapes.eachLayer((layer) => {
        layer.options.interactive = enabled;
      });
    map.on("pm:create", onCreate);
    map.on("pm:remove", report);
    map.on("pm:globalremovalmodetoggled", onRemovalModeToggled);

    return () => {
      map.off("pm:create", onCreate);
      map.off("pm:remove", report);
      map.off("pm:globalremovalmodetoggled", onRemovalModeToggled);
      map.pm.removeControls();
      shapes.remove();
    };
  }, [map, position, shapeStyle]);

  return null;
};

export default UserShapeControl;
