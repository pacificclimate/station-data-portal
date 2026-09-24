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
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

L.PM.setOptIn(true);

// Keep rectangles as lat/lng boxes, as leaflet-draw drew them (a trapezoid on
// the BC map's Albers projection). Geoman works out every rectangle's corners
// here (while drawing, and when a corner is dragged in edit mode) as a box on
// screen, then creates the finished rectangle as a lat/lng box, so without
// this the shape jumps on release. The angle is ignored: rotate mode is off,
// and in edit mode Geoman infers one from the first edge, a meridian that
// Albers draws tilted.
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

    map.pm.setGlobalOptions({
      layerGroup: shapes,
      pathOptions: { ...shapeStyle, pmIgnore: false },
      templineStyle: shapeStyle,
      hintlineStyle: { ...shapeStyle, dashArray: [5, 5] },
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
    // leaflet-draw offered "Clear all layers" in delete mode; keep it.
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
      layer.on("pm:edit", report);
      report();
    };
    map.on("pm:create", onCreate);
    map.on("pm:remove", report);

    return () => {
      map.off("pm:create", onCreate);
      map.off("pm:remove", report);
      map.pm.removeControls();
      shapes.remove();
    };
  }, [map, position, shapeStyle]);

  return null;
};

export default UserShapeControl;
