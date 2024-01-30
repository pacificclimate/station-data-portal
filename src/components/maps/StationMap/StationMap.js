"use client";

// This component displays a map with a station marker for each station.
//
// Notes on user shape feature group:
//
//  Terminology
//
//  - Leaflet uses the term 'layer' for all single polygons, markers, etc.
//    Leaflet uses the term 'layer group' for an object (itself also a
//    layer, i.e, a subclass of `Layer`) that groups layers together.
//
//  Purpose
//
//  - The purpose of the user shape feature group is to allow the user to define
//    a spatial area of interest. This area drives the spatial data averaging
//    performed by various other data display tools (graphs, tables).
//
//  Behaviour
//
//  - The user shape feature group is initially empty. Geometry can be added to
//    it by any combination of drawing (on the map) and editing and/or
//    deleting existing geometry.
//
//  - Previous versions of this component had some unused infrastructure for
//    the user to upload a selection shape. That has all been removed, giving a
//    major simplification and significant speed up of this component.
//    The previous implementation of user upload caused double-renders of
//    the map, which is slow. Any reimplementation of this feature will have
//    to be very careful about causing double updates.
//
//  `onSetArea` callback
//
//  - All changes (add, edit) to the contents of the user shape feature group
//    are communicated by the `DataMap` callback prop `onSetArea`. This callback
//    is more or less the whole point of the user shape feature group.
//
//  - `onSetArea` is called with a single GeoJSON object representing the
//    contents of the layer group.

import PropTypes from "prop-types";
import React, { useMemo, useRef, useEffect, useTransition } from "react";

import { FeatureGroup, LayerGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import { setLethargicMapScrolling } from "../../../utils/leaflet-extensions";
import { setTimingEnabled } from "../../../utils/timing";

import MapInfoDisplay from "../MapInfoDisplay";
import { defaultMarkerOptions, ManyStationMarkers } from "../StationMarkers";
import { layersToGeoJSONMultipolygon } from "../../../utils/geoJSON-leaflet";

import logger from "../../../logger";

import "./StationMap.css";
import { getTimer } from "../../../utils/timing";
import { MapSpinner } from "pcic-react-leaflet-components";
import { useImmer } from "use-immer";
import { useStore } from "../../../state/state-store";
import { StationRefresh } from "../StationRefresh/StationRefresh";
import baseMaps from "../../maps/baseMaps";

logger.configure({ active: true });
const smtimer = getTimer("StationMarker timing");
smtimer.log();

const getZoomMarkerRadius = ({ config }) => {
  const zmrSpec = config.zoomToMarkerRadiusSpec;
  return (zoom) => {
    for (const [_zoom, radius] of zmrSpec) {
      if (zoom <= _zoom) {
        return radius;
      }
    }
    return zmrSpec[zmrSpec.length - 1][1];
  };
};

function StationMap({
  config,
  stations,
  metadata,
  onSetArea = () => {},
  userShapeStyle = {
    color: "#f49853",
    weight: 1,
  },
  onReloadStations = () => {},

  externalIsPending,
  // This is a transition-pending value passed in from the parent, and
  // should be true if and only if slow updates to the map are pending
  // due to an external update.
}) {
  const userShapeLayerRef = useRef();
  const { BaseMap, initialViewport } = baseMaps[config.baseMap];
  BaseMap.tileset.url =
    "https://services.pacificclimate.org/tiles/bc-albers-lite/{z}/{x}/{y}.png";

  // TODO: Remove
  // const [geometryLayers, setGeometryLayers] = useState([]);

  const handleChangedGeometryLayers = () => {
    const layers = userShapeLayerRef?.current?.getLayers();
    onSetArea(layers && layersToGeoJSONMultipolygon(layers));
  };

  useEffect(() => {
    if (config === null) {
      return;
    }

    // Set up (polygon) drawing tool in Leaflet.
    L.drawLocal.edit.toolbar.buttons = {
      edit: "Edit shapes",
      editDisabled: "No shapes to edit",
      remove: "Remove shapes",
      removeDisabled: "No shapes to remove",
    };
    L.drawLocal.edit.handlers.remove.tooltip = "Click shape to remove";
    L.drawLocal.edit.toolbar.actions.clearAll = {
      title: "Remove all shapes",
      text: "Remove all",
    };

    // Initialize Lethargy, which fixes scrolling problems with Mac computers.
    if (config.lethargy.enabled) {
      setLethargicMapScrolling(
        config.lethargy.stability,
        config.lethargy.sensitivity,
        config.lethargy.tolerance,
      );
    }

    // Export timing values to non-component code
    setTimingEnabled(config.timingEnabled);
  }, [config]);

  // Manage marker radius as a function of zoom. Use a transition so that it
  // doesn't interrupt other UI activity (including updating the base map).
  // An immutable value makes setting `markerOptions` nice. To slightly improve
  // performance, we use memoization in setting initial state and defining the
  // map events.
  const [markerOptions, setMarkerOptions] = useImmer(() => ({
    ...defaultMarkerOptions,
    radius: getZoomMarkerRadius({ config })(initialViewport.zoom),
  }));
  const [markerUpdateIsPending, markerUpdateStartTransition] = useTransition();
  const markerMapEvents = useMemo(
    () => ({
      zoomend: (leafletMap) => {
        markerUpdateStartTransition(() => {
          setMarkerOptions((draft) => {
            draft.radius = getZoomMarkerRadius({ config })(
              leafletMap.getZoom(),
            );
          });
        });
      },
    }),
    [],
  );

  smtimer.log();
  smtimer.resetAll();

  // Splitting the `stations` memoization into two steps, markers and
  // layer group, seems to provide a more responsive UI. It's not clear why.
  // Or I might just be seeing ghosts.

  const markers = useMemo(
    () => (
      <ManyStationMarkers
        stations={stations}
        metadata={metadata}
        markerOptions={markerOptions}
        mapEvents={markerMapEvents}
      />
    ),
    [stations, markerOptions],
  );

  const markerLayerGroup = useMemo(
    () => <LayerGroup>{markers}</LayerGroup>,
    [markers],
  );

  const isPending = externalIsPending || markerUpdateIsPending;

  return (
    <BaseMap
      zoom={initialViewport.zoom}
      center={initialViewport.center}
      preferCanvas={true}
      maxZoom={13}
    >
      <MapInfoDisplay
        position={"bottomleft"}
        what={(map) => `Zoom: ${map.getZoom()}`}
      />
      <FeatureGroup ref={userShapeLayerRef}>
        <EditControl
          position={"topleft"}
          draw={{
            marker: false,
            circlemarker: false,
            circle: false,
            polyline: false,
            polygon: {
              showArea: false,
              showLength: false,
              shapeOptions: userShapeStyle,
            },
            rectangle: {
              showArea: false,
              showLength: false,
              shapeOptions: userShapeStyle,
            },
          }}
          onCreated={handleChangedGeometryLayers}
          onEdited={handleChangedGeometryLayers}
          onDeleted={handleChangedGeometryLayers}
        />
        {config.showReloadStationsButton && (
          <StationRefresh
            position={"topleft"}
            onReloadStations={onReloadStations}
          />
        )}
      </FeatureGroup>
      {markerLayerGroup}
      {isPending && <MapSpinner {...config.mapSpinner} />}
    </BaseMap>
  );
}
StationMap = React.memo(StationMap);

StationMap.propTypes = {
  stations: PropTypes.array.isRequired,
  metadata: PropTypes.object,
  onSetArea: PropTypes.func,
};

export default StationMap;
