import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import { Popup } from 'react-leaflet'
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import join from 'lodash/fp/join';
import chroma from 'chroma-js';
import FrequencySelector from '../../selectors/FrequencySelector';

import logger from '../../../logger';

import './StationPopup.css';
import {
  uniqStationFreqs,
  uniqStationLocations,
  uniqStationNames, uniqStationObsPeriods
} from '../../../utils/station-info';

logger.configure({ active: true });


const formatDate = d => d ? d.toISOString().substr(0,10) : 'unknown';


class StationPopup extends Component {
  static propTypes = {
    station: PropTypes.object.isRequired,
    network: PropTypes.object.isRequired,
    variables: PropTypes.array.isRequired,
    defaultNetworkColor: PropTypes.string,
  };

  static defaultProps = {
    defaultNetworkColor:
      process.env.REACT_APP_DEFAULT_NETWORK_COLOR ?? '#000000',
  }

  render() {
    const { station, network, variables, defaultNetworkColor } = this.props;
    const networkColor =
      chroma(network.color ?? defaultNetworkColor).alpha(0.5).css();


    const stationNames = flow(
      uniqStationNames,
      join(", "),
    )(station);

    const stationLocations = (
      <ul className={"compact"}>
        {
          flow(
            uniqStationLocations,
            map(loc => (
              <li>
                {-loc.lon} W <br/>
                {loc.lat} N <br/>
                Elev. {loc.elevation} m
              </li>
            )),
          )(station)
        }
      </ul>
    );

    const stationObsPeriods = (
      <ul className={"histories"}>
        {
          flow(
            uniqStationObsPeriods,
            map(hx => (
              <li>{formatDate(hx.min_obs_time)} to {formatDate(hx.max_obs_time)}</li>
            ))
          )(station)
        }
      </ul>
    );
    const stationObsFreqs = (
      <ul className={"compact"}>
        {
          flow(
            uniqStationFreqs,
            map(freq => (<li>{FrequencySelector.valueToLabel(freq)}</li>)),
          )(station)
        }
      </ul>
    );

    return (
      <Popup>
        <h1>Station: {stationNames}</h1>
        <Table size={'sm'} condensed>
          <tbody>
          <tr>
            <td>Network</td>
            <td>
              <span style={{backgroundColor: networkColor}}>
                {`${network.name}`}
              </span>
            </td>
          </tr>
          <tr>
            <td>Native ID</td>
            <td>{station.native_id}</td>
          </tr>
          <tr>
            <td>Database ID</td>
            <td>{station.id}</td>
          </tr>
          <tr>
            <td>Locations</td>
            <td>{stationLocations}</td>
          </tr>
          <tr>
            <td>Record spans</td>
            <td>{stationObsPeriods}</td>
          </tr>
          <tr>
            <td>Observation freqs</td>
            <td>{stationObsFreqs}</td>
          </tr>
          <tr>
            <td>Recorded variables</td>
            <td>
              <ul className={"variables"}>
                {
                  map(variable => (
                    <li>{variable.display_name}</li>
                  ))(variables)
                }
              </ul>
            </td>
          </tr>
          </tbody>
        </Table>
      </Popup>
    );
  }
}

export default StationPopup;
