import PropTypes from 'prop-types';
import React from 'react';
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
  stationNetwork,
  uniqStationFreqs,
  uniqStationLocations,
  uniqStationNames,
  uniqStationObsPeriods,
  uniqStationVariableNames,
} from '../../../utils/station-info';
import { config } from '../../../utils/configuration';

logger.configure({ active: true });


const formatDate = d => d ? d.toISOString().substr(0,10) : 'unknown';


function StationPopup({
  station,
  defaultNetworkColor = config.defaultNetworkColor,
  metadata,
}) {
  const network = stationNetwork(metadata.networks, station);
  const networkColor =
    chroma(network.color ?? defaultNetworkColor).alpha(0.5).css();

  const stationNames = flow(
    uniqStationNames,
    join(", "),
  )(station);

  const stationLocations = (
    <ul className={"compact scroll-y"}>
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
    <ul className={"compact scroll-y"}>
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

  const variableNames = (
    <ul className={"compact"}>
      {map(
        name => (<li>{name}</li>),
        uniqStationVariableNames(metadata.variables, station)
      )}
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
          <td>History count</td>
          <td>{station.histories.length}</td>
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
          <td>{variableNames}</td>
        </tr>
        </tbody>
      </Table>
    </Popup>
  );
}

StationPopup.propTypes = {
  station: PropTypes.object.isRequired,
  metadata: PropTypes.object.isRequired,
  defaultNetworkColor: PropTypes.string,
};

export default StationPopup;
