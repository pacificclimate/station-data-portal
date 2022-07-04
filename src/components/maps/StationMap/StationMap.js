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


import PropTypes from 'prop-types';
import React, {
  useEffect,
  useMemo,
  useRef,
  useTransition
} from 'react';

import { FeatureGroup, LayerGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import MarkerCluster from '../MarkerCluster';
import L from 'leaflet';

import MapInfoDisplay from '../MapInfoDisplay';
import { defaultMarkerOptions, ManyStationMarkers } from '../StationMarkers';
import { layersToGeoJSONMultipolygon } from '../../../utils/geoJSON-leaflet';

import logger from '../../../logger';

import './StationMap.css';
import { getTimer } from '../../../utils/timing';
import { MapSpinner } from 'pcic-react-leaflet-components';
import { zoomToMarkerRadius } from '../../../utils/configuration';
import { useImmer } from 'use-immer';

logger.configure({ active: true });
const smtimer = getTimer("StationMarker timing")
smtimer.log();

function StationMap({
  BaseMap,
  initialViewport,
  stations,
  allNetworks,
  allVariables,
  onSetArea = () => {},
  markerClusterOptions,
  userShapeStyle = {
    color: "#f49853",
    weight: 1,
  },

  externalIsPending,
  // This is a transition-pending value passed in from the parent, and
  // should be true if and only if slow updates to the map are pending
  // due to an external update.
}) {
  const userShapeLayerRef = useRef();

  // TODO: Remove
  // const [geometryLayers, setGeometryLayers] = useState([]);

  // Set up drawing tool. This might be better done elsewhere.
  useEffect(() => {
    // console.log("### L.drawLocal.draw", L.drawLocal.draw)
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
  }, []);

  const handleChangedGeometryLayers = () => {
    const layers = userShapeLayerRef?.current?.getLayers();
    onSetArea(layers && layersToGeoJSONMultipolygon(layers));
  };

  // Manage marker radius as a function of zoom. Use a transition so that it
  // doesn't interrupt other UI activity (including updating the base map).
  // An immutable value makes setting `markerOptions` nice. To slightly improve
  // performance, we use memoization in setting initial state and defining the
  // map events.
  const [markerOptions, setMarkerOptions] = useImmer(() => ({
    ...defaultMarkerOptions,
    radius: zoomToMarkerRadius(initialViewport.zoom),
  }));
  const [markerUpdateIsPending, markerUpdateStartTransition] = useTransition();
  const markerMapEvents = useMemo(() => ({
    zoomend: (leafletMap) => {
      markerUpdateStartTransition(() => {
        setMarkerOptions(draft => {
          draft.radius = zoomToMarkerRadius(leafletMap.getZoom());
        });
      });
    }
  }), []);

  smtimer.log();
  smtimer.resetAll();

  // Splitting the `stations` memoization into two steps, markers and
  // layer group, seems to provide a more responsive UI. It's not clear why.
  // Or I might just be seeing ghosts.

  const markers = useMemo(() =>
    <ManyStationMarkers
      stations={stations}
      allNetworks={allNetworks}
      allVariables={allVariables}
      markerOptions={markerOptions}
      mapEvents={markerMapEvents}
    />,
    [stations, markerOptions]
  );

  const markerLayerGroup = useMemo(() =>
    markerClusterOptions ? (
      <MarkerCluster {...markerClusterOptions}>{markers}</MarkerCluster>
    ) : (
      <LayerGroup>{markers}</LayerGroup>
    ),
    [markers]
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
        what={map => `Zoom: ${map.getZoom()}`}
      />
      <FeatureGroup ref={userShapeLayerRef}>
        <EditControl
          position={'topleft'}
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
      </FeatureGroup>
      {markerLayerGroup}
      {isPending &&
        <MapSpinner
          spinner={"Bars"}
          x={"40%"}
          y={"40%"}
          width={"80"}
          stroke={"darkgray"}
          fill={"lightgray"}
        />
      }
    </BaseMap>
  );
}
StationMap = React.memo(StationMap)

StationMap.propTypes = {
  BaseMap: PropTypes.func.isRequired,
  initialViewport: PropTypes.object.isRequired,
  stations: PropTypes.array.isRequired,
  allNetworks: PropTypes.array,
  allVariables: PropTypes.array,
  onSetArea: PropTypes.func,
};

export default StationMap;
