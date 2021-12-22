import PropTypes from 'prop-types';
import React from 'react';
import { CircleMarker, Polygon } from 'react-leaflet';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';

import StationTooltip from '../StationTooltip';
import StationPopup from '../StationPopup';

import logger from '../../../logger';

import './StationMarkers.css';
import {
  stationNetwork,
  uniqStationLocations
} from '../../../utils/station-info';
import chroma from 'chroma-js';

logger.configure({ active: true });


const noStations = [];


function StationMarker({
  station, allNetworks, allVariables, markerOptions, polygonOptions
}) {
  const network = stationNetwork(allNetworks, station);
  const polygonColor =
    chroma(network.color ?? polygonOptions.color).alpha(0.3).css();

  const uniqLatLngs = flow(
    uniqStationLocations,
    map(hx => ({ lng: hx.lon, lat: hx.lat }))
  )(station);

  const stationTooltip = (
    <StationTooltip
      station={station}
      allNetworks={allNetworks}
    />
  );

  const stationPopup = (
    <StationPopup
      station={station}
      allNetworks={allNetworks}
      allVariables={allVariables}
    />
  );

  return (
    <React.Fragment>
      {
        map(
          latLng => (
            <CircleMarker
              key={station.id}
              center={latLng}
              {...markerOptions}
              color={network && network.color}
            >
              {stationTooltip}
              {stationPopup}
            </CircleMarker>
          ),
          uniqLatLngs
        )
      }
      {
        uniqLatLngs.length > 1 && (
          <Polygon
            {...polygonOptions}
            color={polygonColor}
            positions={uniqLatLngs}
          >
            {stationTooltip}
            {stationPopup}
          </Polygon>
        )
      }
    </React.Fragment>
  );
}

const commonStationMarkerPropTypes = {
  allNetworks: PropTypes.array.isRequired,
  allVariables: PropTypes.array.isRequired,
  markerOptions: PropTypes.object,
  polygonOptions: PropTypes.object,
};

StationMarker.propTypes = {
  station: PropTypes.object.isRequired,
  ...commonStationMarkerPropTypes,
};

StationMarker.defaultProps = {
  markerOptions: {
    radius: 4,
    weight: 1,
    fillOpacity: 0.75,
    color: '#000000',
  },
  polygonOptions: {
    color: "green",
  },
};


function StationMarkers({
  stations, ...rest
}) {
  return (
    map(
      station => (
        <StationMarker station={station} {...rest}/>
      ),
      stations || noStations
    )
  );
}

StationMarkers.propTypes = {
  stations: PropTypes.array.isRequired,
  ...commonStationMarkerPropTypes,
};

StationMarkers.defaultProps = StationMarker.defaultProps;

export default StationMarkers;
