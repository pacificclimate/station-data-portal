// This component displays a map with a station marker for each station.
//
// Notes on geometry layer group:
//
//  Terminology
//
//  - Leaflet uses the term 'layer' for all single polygons, markers, etc.
//    Leaflet uses the term 'layer group' for an object (itself also a
//    layer, i.e, a subclass of `Layer`) that groups layers together.
//
//  Purpose
//
//  - The purpose of the geometry layer group is to allow the user to define
//    a spatial area of interest. This area drives the spatial data averaging
//    performed by various other data display tools (graphs, tables).
//
//  Behaviour
//
//  - The geometry layer group is initially empty. Geometry can be added to
//    it by any combination of drawing (on the map) and editing and/or
//    deleting existing geometry.
//
//  `onSetArea` callback
//
//  - All changes (add, edit) to the contents of the geometry layer group are
//    communicated by the `DataMap` callback prop `onSetArea`. This callback
//    is more or less the whole point of the geometry layer group.
//
//  - `onSetArea` is called with a single GeoJSON object representing the
//    contents of the layer group.


import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import without from 'lodash/fp/without';
import { forEachWithKey } from '../../../utils/fp';

import { LayerGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';

import StationMarkers from '../StationMarkers';
import LayerControlledFeatureGroup from '../LayerControlledFeatureGroup';
import {
  geoJSONToLeafletLayers,
  layersToGeoJSONMultipolygon
} from '../../../utils/geoJSON-leaflet';

import logger from '../../../logger';

import './StationMap.css';
import { getTimer } from '../../../utils/timing';

logger.configure({ active: true });
const smtimer = getTimer("StationMarker timing")
smtimer.log();

function StationMap({
  BaseMap,
  initialViewport,
  stations,
  allNetworks,
  allVariables,
  onSetArea,
  inactiveGeometryStyle = {
    color: '#777777'
  },
  activeGeometryStyle = {
    color: '#33ff36'
  },
}) {

  const [geometryLayers, setGeometryLayers] = useState([]);

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
    console.log("### L.drawLocal", L.drawLocal)
  }, []);

  // When user-drawn layers (shapes) change, call onSetArea callback with
  // GeoJSON representation of layers.
  useEffect(() => {
    onSetArea(geometryLayers && layersToGeoJSONMultipolygon(geometryLayers));
  }, [geometryLayers]);

  // When user-drawn layers (shapes) change, update their style. This is mainly
  // useful when there is more than one layer, which there cannot be without
  // either shape uploads (not currently enabled) or allowing multiple shapes
  // to be drawn (currently disallowed).
  useEffect(() => {
    forEachWithKey(
      (layer, i) => {
        layer.setStyle(i > 0 ? inactiveGeometryStyle : activeGeometryStyle);
        // The following prevents the geometry from blocking interaction with
        // the markers, but it disables the edit and delete functions for the
        // geometry. We don't like that any more.
        // layer.setStyle({ interactive: false });
      },
      geometryLayers
    );
  }, [geometryLayers]);

  const addGeometryLayer = layer => {
    // TODO: Is this where double renders come from? Probably. We are doing
    //  a controlled component, but the edit tool automatically adds the new
    //  layer -- triggering a render, I believe -- before we receive notice
    //  of it and update `geometryLayers` -- which triggers another render.
    setGeometryLayers(geometryLayers.concat([layer]));
  };

  const addGeometryLayers = layers => {
    setGeometryLayers(geometryLayers.concat(layers));
  };

  const editGeometryLayers = layers => {
    // TODO: How to handle multiple layers? It's not clear how to
    //  identify which layer was edited. This works for now since we don't
    //  allow drawing multiple layers or uploading layers. The latter will
    //  put the problem front and center.
    // console.log("### editGeometryLayers", layers)
    setGeometryLayers(layers)
  };

  const deleteGeometryLayers = layers => {
    setGeometryLayers(without(layers, geometryLayers));
  };

  const eventLayers = e => {
    // Extract the Leaflet layers from an editing event, returning them
    // as an array of layers.
    // Note: `e.layers` is a special class, not an array of layers, so we
    // have to go through this rigmarole to get the layers.
    // The alternative of accessing the private property `e.layers._layers`
    // (a) is naughty, and (b) fails.
    console.log("### eventLayers", e)
    let layers = [];
    e.layers.eachLayer(layer => layers.push(layer));
    return layers;
  };

  const handleAreaCreated = e => addGeometryLayer(e.layer);
  const handleAreaEdited = e => editGeometryLayers(eventLayers(e));
  const handleAreaDeleted = e => deleteGeometryLayers(eventLayers(e));

  // NOTE: This handler is not used ... yet. But all the infrastructure is
  // in place for it should it be wanted.
  const handleUploadArea = (geoJSON) => {
    addGeometryLayers(geoJSONToLeafletLayers(geoJSON));
  };

  const allowGeometryDraw = geometryLayers.length === 0;
  // const allowGeometryDraw = true;
  smtimer.log();
  smtimer.resetAll();

  // alert("StationMap render")

  return (
    <BaseMap viewport={initialViewport} preferCanvas={true}>
      <LayerControlledFeatureGroup
        layers={geometryLayers}
      >
        <EditControl
          position={'topleft'}
          draw={{
            marker: false,
            circlemarker: false,
            circle: false,
            polyline: false,
            polygon: allowGeometryDraw && {
              showArea: false,
              showLength: false,
            },
            rectangle: allowGeometryDraw && {
              showArea: false,
              showLength: false,
            },
          }}
          onCreated={handleAreaCreated}
          onEdited={handleAreaEdited}
          onDeleted={handleAreaDeleted}
        />
      </LayerControlledFeatureGroup>
      <LayerGroup>
        <StationMarkers
          stations={stations}
          allNetworks={allNetworks}
          allVariables={allVariables}
        />
      </LayerGroup>
    </BaseMap>
  );
}

StationMap.propTypes = {
  BaseMap: PropTypes.object.isRequired,
  initialViewport: PropTypes.object.isRequired,
  stations: PropTypes.array.isRequired,
  allNetworks: PropTypes.array.isRequired,
  allVariables: PropTypes.array.isRequired,
  onSetArea: PropTypes.func.isRequired,
};

export default StationMap;
