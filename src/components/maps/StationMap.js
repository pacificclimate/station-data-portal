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

import React, { useEffect, useMemo, useRef, useTransition } from "react";

import { FeatureGroup, LayerGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import isEqual from "lodash/fp/isEqual";
import { layersToGeoJSONMultipolygon } from "@/utils/geoJSON-leaflet";
import { getTimer } from "@/utils/timing";
import baseMaps from "@/components/maps/baseMaps";

import MapInfoDisplay from "./MapInfoDisplay";
import { defaultMarkerOptions, ManyStationMarkers } from "./StationMarkers";

import logger from "@/logger";
import { MapSpinner } from "pcic-react-leaflet-components";
import { useImmer } from "use-immer";
import { StationRefresh } from "./StationRefresh/StationRefresh";
import useConfigContext from "@/state/context-hooks/use-config-context";
import { useStationsStore } from "@/state/client/stations-store";
import { useStations } from "@/state/query-hooks/use-stations";
import { useStationFilteringContext } from "@/state/context-hooks/use-station-filtering-context";

logger.configure({ active: true });
const smtimer = getTimer("StationMarker timing");
smtimer.log();

const StationMapRenderer = React.memo(
  ({
    BaseMap,
    initialViewport,
    baseMapTilesUrl,
    userShapeLayerRef,
    userShapeStyle,
    handleChangedGeometryLayers,
    stations,
    onReloadStations,
    config,
    externalIsPending,
  }) => {
    // Manage marker radius as a function of zoom. Use a transition so that it
    // doesn't interrupt other UI activity (including updating the base map).
    // An immutable value makes setting `markerOptions` nice. To slightly improve
    // performance, we use memoization in setting initial state and defining the
    // map events.
    const [markerOptions, setMarkerOptions] = useImmer(() => ({
      ...defaultMarkerOptions,
      radius: config.zoomToMarkerRadius(initialViewport.zoom),
    }));
    const [markerLayerGroup, setMarkers] = useImmer(<></>);
    const [markerUpdateIsPending, markerUpdateStartTransition] =
      useTransition();
    const [markerRenderIsPending, markerRenderStartTransition] =
      useTransition();
    const markerMapEvents = useMemo(
      () => ({
        zoomend: (leafletMap) => {
          markerUpdateStartTransition(() => {
            setMarkerOptions((draft) => {
              draft.radius = config.zoomToMarkerRadius(leafletMap.getZoom());
            });
          });
        },
      }),
      [],
    );

    // By applying these markers into a piece of local state and wrapping their generation into a transition,
    // changes to the markers can be decoupled from the rendering of the rest of the map allowing for more
    // responsive user interaction when interacting with filters or switching between pages. Further wrapping the
    // whole operation in a useEffect ensures that the markers are only generated when the stations or marker options
    // change.
    useEffect(() => {
      markerRenderStartTransition(() => {
        setMarkers(() => (
          <LayerGroup>
            <ManyStationMarkers
              stations={stations}
              markerOptions={markerOptions}
              mapEvents={markerMapEvents}
            />
          </LayerGroup>
        ));
      });
    }, [stations, markerOptions]);

    const isPending =
      externalIsPending || markerUpdateIsPending || markerRenderIsPending;

    console.log(baseMapTilesUrl);

    return (
      <BaseMap
        zoom={initialViewport.zoom}
        center={initialViewport.center}
        baseMapTilesUrl={baseMapTilesUrl}
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
  },
  (prevProps, nextProps) => {
    const equal = isEqual(prevProps, nextProps);
    return equal;
  },
);

const userShapeStyleDefault = {
  color: "#f49853",
  weight: 1,
};

const reloadStationDefault = () => {};

const StationMap = ({
  userShapeStyle = userShapeStyleDefault,
  onReloadStations = reloadStationDefault,
}) => {
  const config = useConfigContext();
  const { isLoading: externalIsPending } = useStations();
  const { setArea } = useStationsStore((state) => ({
    setArea: state.setArea,
  }));
  const { isFiltering, filteredStations: stations } =
    useStationFilteringContext();

  const userShapeLayerRef = useRef();

  const { BaseMap, initialViewport, baseMapTilesUrl } =
    baseMaps[config.baseMap];

  const handleChangedGeometryLayers = useMemo(
    () => () => {
      const layers = userShapeLayerRef?.current?.getLayers();
      setArea(layers && layersToGeoJSONMultipolygon(layers));
    },
    [userShapeLayerRef],
  );

  smtimer.log();
  smtimer.resetAll();

  return (
    <StationMapRenderer
      {...{
        BaseMap,
        initialViewport,
        baseMapTilesUrl,
        userShapeLayerRef,
        userShapeStyle,
        handleChangedGeometryLayers,
        onReloadStations,
        config,
        stations,
        externalIsPending: isFiltering || externalIsPending,
      }}
    />
  );
};

StationMap.propTypes = {};

export default StationMap;
