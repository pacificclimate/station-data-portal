import PropTypes from 'prop-types';
import React from 'react';
import { CircleMarker, Polygon } from 'react-leaflet';
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


logger.configure({ active: true });
const timer = getTimer("StationMarker timing");


const LocationMarker = ({
  station,
  location,
  color,
  allNetworks,
  allVariables,
  markerOptions,
}) => {
  return (
    <CircleMarker
      key={location.id}
      center={location}
      {...markerOptions}
      color={color}
    >
      <StationTooltip
        station={station}
        allNetworks={allNetworks}
      />
      <StationPopup
        station={station}
        allNetworks={allNetworks}
        allVariables={allVariables}
      />
    </CircleMarker>
  );
};


const MultiLocationMarker = ({
  station,
  locations,
  color,
  polygonOptions,
  allNetworks,
  allVariables,
}) => {
  if (locations.length <= 1) {
    return null;
  }
  return (
    <Polygon
      {...polygonOptions}
      color={color}
      positions={locations}
    >
      <StationTooltip
        station={station}
        allNetworks={allNetworks}
      />
      <StationPopup
        station={station}
        allNetworks={allNetworks}
        allVariables={allVariables}
      />
    </Polygon>
  );
};


const StationMarkers = timer.timeThis("StationMarker")(({
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
}) => {
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
});

StationMarkers.propTypes = {
  station: PropTypes.object.isRequired,
  allNetworks: PropTypes.array.isRequired,
  allVariables: PropTypes.array.isRequired,
  markerOptions: PropTypes.object,
  polygonOptions: PropTypes.object,
};

export default StationMarkers;
