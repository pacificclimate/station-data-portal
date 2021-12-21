import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import { Popup } from 'react-leaflet'
import map from 'lodash/fp/map';
import chroma from 'chroma-js';
import FrequencySelector from '../../selectors/FrequencySelector';

import logger from '../../../logger';

import './StationPopup.css';

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
    const histories = station.histories;
    const history0 = histories[0];
    const networkColor =
      chroma(network.color ?? defaultNetworkColor).alpha(0.5).css();
    return (
      <Popup>
        <h1>Station: {history0.station_name} <span>({network.name})</span></h1>
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
            <td>{history0.lon}</td>
          </tr>
          <tr>
            <td>Latitude</td>
            <td>{history0.lat}</td>
          </tr>
          <tr>
            <td>Elevation</td>
            <td>{history0.elevation}</td>
          </tr>
          <tr>
            <td>Record span (histories: {histories.length})</td>
            <td>
              <ul className={"histories"}>
                {
                  map(hx => (
                    <li>{formatDate(hx.min_obs_time)} to {formatDate(hx.max_obs_time)}</li>
                  ))(histories)
                }
              </ul>
            </td>
          </tr>
          <tr>
            <td>Observation frequency</td>
            <td>{FrequencySelector.valueToLabel(history0.freq)}</td>
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
