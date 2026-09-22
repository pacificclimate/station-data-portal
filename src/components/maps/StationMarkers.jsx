import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { CircleMarker, Polygon, useMap, useMapEvents } from "react-leaflet";
import map from "lodash/fp/map";
import flow from "lodash/fp/flow";
import mapValues from "lodash/fp/mapValues";
import logger from "@/logger";

import StationPopup from "./StationPopup";
import StationTooltip from "./StationTooltip";
import { stationNetwork, uniqStationLocations } from "@/utils/station-info";
import chroma from "chroma-js";
import { getTimer } from "@/utils/timing";
import { useNetworks } from "@/state/query-hooks/use-networks";

logger.configure({ active: true });
const timer = getTimer("StationMarkers timing");

// This user hook implements lazy marker popup generation.
// Returns an object `{ markerRef, addPopup, popup }`:
//  `markerRef`: React ref to be attached to marker.
//  `addPopup`: Callback to be attached to event (usually click) on marker that
//    triggers popup. Creates the popup (once; effectively memoized).
//  `popup`: Lazily created popup to be rendered inside marker. Value `null`
//    until `addPopup` called; value is the popup thereafter.
const useLazyPopup = ({ station }) => {
  const markerRef = useRef();
  const [popup, setPopup] = useState(null);

  // Callback: create popup if not already created.
  const addPopup = () => {
    if (popup === null) {
      setPopup(<StationPopup station={station} />);
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
}) {
  const { markerRef, popup, addPopup } = useLazyPopup({ station });

  return (
    <CircleMarker
      ref={markerRef}
      key={location.id}
      center={location}
      {...markerOptions}
      color={color}
      eventHandlers={{ click: addPopup }}
    >
      <StationTooltip station={station} />
      {popup}
    </CircleMarker>
  );
}
LocationMarker.propTypes = {
  station: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  color: PropTypes.string,
  markerOptions: PropTypes.object,
};

function MultiLocationMarker({
  station,
  locations, // Unique locations for station.
  color, // Station colour; applied to all location markers
  polygonOptions, // Multi-location marker is a polygon; this is its format
}) {
  const { markerRef, popup, addPopup } = useLazyPopup({ station });

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
      <StationTooltip station={station} />
      {popup}
    </Polygon>
  );
}
MultiLocationMarker.propTypes = {
  station: PropTypes.object.isRequired,
  locations: PropTypes.array.isRequired,
  color: PropTypes.string.isRequired,
  polygonOptions: PropTypes.object,
};

export function OneStationMarkers({
  station,
  markerOptions = defaultMarkerOptions,
  // TODO: Improve or remove
  polygonOptions = {
    color: "green",
  },
}) {
  const { data: networks } = useNetworks();
  const network = stationNetwork(networks, station);
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
      />
    </React.Fragment>
  );
}
OneStationMarkers = timer.timeThis("OneStationMarkers")(OneStationMarkers);
OneStationMarkers.propTypes = {
  station: PropTypes.object.isRequired,
  markerOptions: PropTypes.object,
  polygonOptions: PropTypes.object,
};

function ManyStationMarkers({
  stations = [],
  markerOptions = defaultMarkerOptions,
  mapEvents = {},
}) {
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
        markerOptions={markerOptions}
      />
    ),
    stations,
  );
}
// ManyStationMarkers = React.memo(ManyStationMarkers);
ManyStationMarkers.propTypes = {
  stations: PropTypes.arrayOf(PropTypes.object).isRequired,
  markerOptions: PropTypes.object,
  mapEvents: PropTypes.object,
};
export { ManyStationMarkers };
