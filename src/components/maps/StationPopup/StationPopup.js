import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import { Popup } from 'react-leaflet'
import { map } from 'lodash/fp';
import chroma from 'chroma-js';

import logger from '../../../logger';

import './StationPopup.css';

logger.configure({ active: true });


const formatDate = s => s ? s.substr(0,10) : 'unknown';


class StationPopup extends Component {
  static propTypes = {
    station: PropTypes.object.isRequired,
    network: PropTypes.array.isRequired,
    variables: PropTypes.array.isRequired,
  };

  render() {
    const { station, network, variables } = this.props;
    const history = station.histories[0];
    const networkColor = chroma(network.color).alpha(0.5).css();
    return (
      <Popup>
        <h1>Station: {history.station_name} <span>({network.name})</span></h1>
        <Table size={'sm'} condensed>
          <tbody>
          <tr>
            <td>Network</td>
            <td>
              <span style={{backgroundColor: networkColor}}>
                {`${network.name} – ${network.long_name}`}
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
            <td>Longitude</td>
            <td>{history.lon}</td>
          </tr>
          <tr>
            <td>Latitude</td>
            <td>{history.lat}</td>
          </tr>
          <tr>
            <td>Elevation</td>
            <td>{history.elevation}</td>
          </tr>
          <tr>
            <td rowSpan={2}>Records</td>
            <td>from {formatDate(station.min_obs_time)}</td>
          </tr>
          <tr>
            <td>to {formatDate(station.max_obs_time)}</td>
          </tr>
          <tr>
            <td>Observation frequency</td>
            <td>{history.freq}</td>
          </tr>
          <tr>
            <td rowSpan={variables.length+1}>Recorded variables</td>
          </tr>
          {
            map(variable => (
              <tr>
                <td>{variable.display_name}</td>
              </tr>
            ))(variables)
          }
          </tbody>
        </Table>
      </Popup>
    );
  }
}

export default StationPopup;
