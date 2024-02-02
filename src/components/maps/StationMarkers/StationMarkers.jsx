import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { CircleMarker, Polygon, useMap, useMapEvents } from "react-leaflet";
import map from "lodash/fp/map";
import flow from "lodash/fp/flow";
import mapValues from "lodash/fp/mapValues";
import StationPopup from "../StationPopup/StationPopup";
import StationTooltip from "../StationTooltip/StationTooltip";

import logger from "../../../logger";

import "./StationMarkers.css";
import {
  stationNetwork,
  uniqStationLocations,
} from "../../../utils/station-info";
import chroma from "chroma-js";
import { getTimer } from "../../../utils/timing";

logger.configure({ active: true });
const timer = getTimer("StationMarkers timing");

// This user hook implements lazy marker popup generation.
// Returns an object `{ markerRef, addPopup, popup }`:
//  `markerRef`: React ref to be attached to marker.
//  `addPopup`: Callback to be attached to event (usually click) on marker that
//    triggers popup. Creates the popup (once; effectively memoized).
//  `popup`: Lazily created popup to be rendered inside marker. Value `null`
//    until `addPopup` called; value is the popup thereafter.
const useLazyPopup = ({ station, metadata }) => {
  const markerRef = useRef();
  const [popup, setPopup] = useState(null);

  // Callback: create popup if not already created.
  const addPopup = () => {
    if (popup === null) {
      setPopup(<StationPopup station={station} metadata={metadata} />);
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

export const defaultMarkerOptions = {
  radius: 4,
  weight: 1,
  fillOpacity: 0.75,
  color: "#000000",
};

function LocationMarker({
  station,
  location, // One location of the station (there may be several)
  color, // Station colour; overrides default color in markerOptions
  markerOptions = defaultMarkerOptions,
  metadata,
}) {
  const { markerRef, popup, addPopup } = useLazyPopup({ station, metadata });

  return (
    <CircleMarker
      ref={markerRef}
      key={location.id}
      center={location}
      {...markerOptions}
      color={color}
      eventHandlers={{ click: addPopup }}
    >
      <StationTooltip station={station} metadata={metadata} />
      {popup}
    </CircleMarker>
  );
}
LocationMarker.propTypes = {
  station: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  color: PropTypes.string,
  metadata: PropTypes.object.isRequired,
  markerOptions: PropTypes.object,
};

function MultiLocationMarker({
  station,
  locations, // Unique locations for station.
  color, // Station colour; applied to all location markers
  polygonOptions, // Multi-location marker is a polygon; this is its format
  metadata,
}) {
  const { markerRef, popup, addPopup } = useLazyPopup({ station, metadata });

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
      <StationTooltip station={station} metadata={metadata} />
      {popup}
    </Polygon>
  );
}
MultiLocationMarker.propTypes = {
  station: PropTypes.object.isRequired,
  locations: PropTypes.array.isRequired,
  color: PropTypes.string.isRequired,
  metadata: PropTypes.object.isRequired,
  polygonOptions: PropTypes.object,
};

function OneStationMarkers({
  station,
  metadata,
  markerOptions = defaultMarkerOptions,
  // TODO: Improve or remove
  polygonOptions = {
    color: "green",
  },
}) {
  const network = stationNetwork(metadata.networks, station);
  const locationColor = network?.color;
  const polygonColor = chroma(network?.color ?? polygonOptions.color)
    .alpha(0.3)
    .css();

  const uniqLatLngs = flow(
    uniqStationLocations,
    map((hx) => ({ id: hx.id, lng: hx.lon, lat: hx.lat })),
  )(station);

  return (
    <React.Fragment>
      {map(
        (location) => (
          <LocationMarker
            station={station}
            location={location}
            color={locationColor}
            metadata={metadata}
            markerOptions={markerOptions}
            key={location.id}
          />
        ),
        uniqLatLngs,
      )}
      <MultiLocationMarker
        station={station}
        locations={uniqLatLngs}
        color={polygonColor}
        polygonOptions={polygonOptions}
        metadata={metadata}
      />
    </React.Fragment>
  );
}
OneStationMarkers = timer.timeThis("OneStationMarkers")(OneStationMarkers);
OneStationMarkers.propTypes = {
  station: PropTypes.object.isRequired,
  metadata: PropTypes.object.isRequired,
  markerOptions: PropTypes.object,
  polygonOptions: PropTypes.object,
};

function ManyStationMarkers({
  stations,
  metadata,
  markerOptions = defaultMarkerOptions,
  mapEvents = {},
}) {
  // Add map events passed in from outside. The callbacks are called
  // with the map as the first argument.
  // TODO: This might be worth making into a custom hook.
  const leafletMap = useMap();
  const mapEventsWithMap = mapValues(
    (eventCallback) =>
      (...eventArgs) =>
        eventCallback(leafletMap, ...eventArgs),
  )(mapEvents);
  useMapEvents(mapEventsWithMap);

  return map(
    (station) => (
      <OneStationMarkers
        key={station.id}
        station={station}
        metadata={metadata}
        markerOptions={markerOptions}
      />
    ),
    stations,
  );
}
// ManyStationMarkers = React.memo(ManyStationMarkers);
ManyStationMarkers.propTypes = {
  stations: PropTypes.arrayOf(PropTypes.object).isRequired,
  metadata: PropTypes.object.isRequired,
  markerOptions: PropTypes.object,
  mapEvents: PropTypes.object,
};
export { ManyStationMarkers };
