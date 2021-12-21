import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { CircleMarker } from 'react-leaflet';
import compact from 'lodash/fp/compact';
import map from 'lodash/fp/map';
import find from 'lodash/fp/find';
import flow from 'lodash/fp/flow';
import tap from 'lodash/fp/tap';

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


class StationMarkers extends Component {
  static propTypes = {
    stations: PropTypes.array.isRequired,
    allNetworks: PropTypes.array.isRequired,
    allVariables: PropTypes.array.isRequired,
    markerOptions: PropTypes.object,
  };

  static defaultProps = {
    markerOptions: {
      radius: 4,
      weight: 1,
      fillOpacity: 0.75,
      color: '#000000',
    },
  };

  render() {
    return (
      flow(
        tap(stations => console.log('stations', stations)),
        map(station => {
          const history = station.histories[0];
          const network = network_for(station, this.props.allNetworks);
          const variables = variables_for(history, this.props.allVariables);
          return (
            history &&
            <CircleMarker
              key={station.id}
              center={{
                lng: history.lon,
                lat: history.lat
              }}
              {...this.props.markerOptions}
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
          )
        })
      )(this.props.stations || noStations)
    );
  }
}

export default StationMarkers;
