import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { CircleMarker, Polygon, useMap, useMapEvents } from 'react-leaflet';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import StationPopup from '../StationPopup';
import StationTooltip from '../StationTooltip';

import logger from '../../../logger';

import './StationMarkers.css';
import {
  stationNetwork,
  uniqStationLocations
} from '../../../utils/station-info';
import chroma from 'chroma-js';
import { getTimer } from '../../../utils/timing';
import { zoomToMarkerRadius } from '../../../utils/configuration';


logger.configure({ active: true });
const timer = getTimer("StationMarkers timing");


// This user hook implements lazy marker popup generation.
// Returns an object `{ markerRef, addPopup, popup }`:
//  `markerRef`: React ref to be attached to marker.
//  `addPopup`: Callback to be attached to event (usually click) on marker that
//    triggers popup. Creates the popup (once; effectively memoized).
//  `popup`: Lazily created popup to be rendered inside marker. Value `null`
//    until `addPopup` called; value is the popup thereafter.
const useLazyPopup = ({ station, allNetworks, allVariables }) => {
  const markerRef = useRef();
  const [popup, setPopup] = useState(null);

  // Callback: create popup if not already created.
  const addPopup = () => {
    if (popup === null) {
      setPopup(
        <StationPopup
          station={station}
          allNetworks={allNetworks}
          allVariables={allVariables}
        />
      );
    }
  };

  // Open popup on initial creation.
  useEffect(() => {
    const element = markerRef?.current;
    if (element) {
      element.openPopup();
    }
  }, [popup]);

  return { markerRef, popup, addPopup };
};


function LocationMarker({
  station,
  location,
  color,
  allNetworks,
  allVariables,
  markerOptions,
}) {
  const { markerRef, popup, addPopup } =
    useLazyPopup({ station, allNetworks, allVariables });

  return (
    <CircleMarker
      ref={markerRef}
      key={location.id}
      center={location}
      {...markerOptions}
      color={color}
      eventHandlers={{click: addPopup}}
    >
      <StationTooltip
        station={station}
        allNetworks={allNetworks}
      />
      {popup}
    </CircleMarker>
  );
}


function MultiLocationMarker ({
  station,
  locations,
  color,
  polygonOptions,
  allNetworks,
  allVariables,
}) {
  const { markerRef, popup, addPopup } =
    useLazyPopup({ station, allNetworks, allVariables });

  if (locations.length <= 1) {
    return null;
  }
  return (
    <Polygon
      ref={markerRef}
      {...polygonOptions}
      color={color}
      positions={locations}
      onClick={addPopup}
    >
      <StationTooltip
        station={station}
        allNetworks={allNetworks}
      />
      {popup}
    </Polygon>
  );
}


function OneStationMarkers({
  station,
  allNetworks,
  allVariables,
  markerOptions = {
    radius: 4,
    weight: 1,
    fillOpacity: 0.75,
    color: '#000000',
  },
  // TODO: Improve or remove
  polygonOptions = {
    color: "green",
  },
}) {
  const network = stationNetwork(allNetworks, station);
  const locationColor = network?.color;
  const polygonColor =
    chroma(network?.color ?? polygonOptions.color).alpha(0.3).css();

  const uniqLatLngs = flow(
    uniqStationLocations,
    map(hx => ({ id: hx.id, lng: hx.lon, lat: hx.lat }))
  )(station);

  return (
    <React.Fragment>
      {
        map(
          location => (
            <LocationMarker
              station={station}
              location={location}
              color={locationColor}
              allNetworks={allNetworks}
              allVariables={allVariables}
              markerOptions={markerOptions}
              key={location.id}
            />
          ),
          uniqLatLngs
        )
      }
      <MultiLocationMarker
        station={station}
        locations={uniqLatLngs}
        color={polygonColor}
        polygonOptions={polygonOptions}
        allNetworks={allNetworks}
        allVariables={allVariables}
      />
    </React.Fragment>
  );
}
OneStationMarkers = timer.timeThis("OneStationMarkers")(OneStationMarkers);


OneStationMarkers.propTypes = {
  station: PropTypes.object.isRequired,
  allNetworks: PropTypes.array.isRequired,
  allVariables: PropTypes.array.isRequired,
  markerOptions: PropTypes.object,
  polygonOptions: PropTypes.object,
};


function ManyStationMarkers({
  stations, allNetworks, allVariables
}) {
  // Control marker radius as a function of zoom level.
  const leafletMap = useMap();
  const [markerRadius, setMarkerRadius] =
    useState(zoomToMarkerRadius(leafletMap.getZoom()));
  const [isPending, startTransition] = React.useTransition();
  useMapEvents({
    zoomend: () => {
      startTransition(() => {
        setMarkerRadius(zoomToMarkerRadius(leafletMap.getZoom()));
      });
    }
  });

  const markerOptions = {
    radius: markerRadius,
    weight: 1,
    fillOpacity: 0.75,
    color: '#000000',
  };
  return map(
    station => (
      <OneStationMarkers
        key={station.id}
        station={station}
        allNetworks={allNetworks}
        allVariables={allVariables}
        markerOptions={markerOptions}
      />
    ),
    stations
  );
}
// ManyStationMarkers = React.memo(ManyStationMarkers);

export { ManyStationMarkers };
