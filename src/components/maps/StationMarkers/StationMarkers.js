import PropTypes from 'prop-types';
import React from 'react';
import { CircleMarker, Polygon } from 'react-leaflet';
import compact from 'lodash/fp/compact';
import map from 'lodash/fp/map';
import find from 'lodash/fp/find';
import flow from 'lodash/fp/flow';
import tap from 'lodash/fp/tap';
import uniqWith from 'lodash/fp/uniqWith';

import { utcDateOnly } from '../../../utils/portals-common';
import StationTooltip from '../StationTooltip';
import StationPopup from '../StationPopup';

import logger from '../../../logger';

import './StationMarkers.css';

logger.configure({ active: true });


const noStations = [];


const network_for = (station, networks) => (
  find({ uri: station.network_uri })(networks)
);


const variables_for = (history, variables) => (
  flow(
    map(variable_uri => find({ uri: variable_uri })(variables)),
    // compacting this array should not be necessary, but the API delivers
    // erroneous data (due ultimately to erroneous database records, I believe)
    // that causes some of the variables to be "missing".
    compact,
  )(history.variable_uris)
);


function StationMarker({ station, allNetworks, allVariables, markerOptions }) {
  const histories = station.histories;
  const history = histories[0];
  const network = network_for(station, allNetworks);
  const variables = variables_for(history, allVariables);

  const uniqLatLngs = flow(
    uniqWith(
      (hx1, hx2) => (
        utcDateOnly(hx1.min_obs_time).getTime()
        === utcDateOnly(hx2.min_obs_time).getTime()
        && utcDateOnly(hx1.max_obs_time).getTime()
        === utcDateOnly(hx2.max_obs_time).getTime()
      )
    ),
    map(hx => ({ lng: hx.lon, lat: hx.lat }))
  )(station.histories);

  return map(
    latLng => (
      <CircleMarker
        key={station.id}
        center={latLng}
        {...markerOptions}
        color={network && network.color}
      >
        <StationTooltip
          station={station}
          network={network}
        />
        <StationPopup
          station={station}
          network={network}
          variables={variables}
        />
      </CircleMarker>
    ),
    uniqLatLngs
  );


  if (histories.length === 0) {
    return null;
  }

  if (histories.length === 1) {
    return (
      <CircleMarker
        key={station.id}
        center={{ lng: history.lon, lat: history.lat }}
        {...markerOptions}
        color={network && network.color}
      >
        <StationTooltip
          station={station}
          network={network}
        />
        <StationPopup
          station={station}
          network={network}
          variables={variables}
        />
      </CircleMarker>
    );
  }

  return (
    <Polygon
      pathOptions={{ color: 'purple' }}
      positions={uniqLatLngs}
    >
      <StationTooltip
        station={station}
        network={network}
      />
      <StationPopup
        station={station}
        network={network}
        variables={variables}
      />
    </Polygon>
  )
}

StationMarker.propTypes = {
  stations: PropTypes.array.isRequired,
  allNetworks: PropTypes.array.isRequired,
  allVariables: PropTypes.array.isRequired,
  markerOptions: PropTypes.object,
};

StationMarker.defaultProps = {
  markerOptions: {
    radius: 4,
    weight: 1,
    fillOpacity: 0.75,
    color: '#000000',
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
  allNetworks: PropTypes.array.isRequired,
  allVariables: PropTypes.array.isRequired,
  markerOptions: PropTypes.object,
};

StationMarkers.defaultProps = {
  markerOptions: {
    radius: 4,
    weight: 1,
    fillOpacity: 0.75,
    color: '#000000',
  },
};

export default StationMarkers;
