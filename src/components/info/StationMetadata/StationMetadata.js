// This component renders a table showing a selected subset of station metadata.
// This component wraps React Table v6. All props passed to this component are
// passed into React Table.

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactTable from 'react-table';

import flow from 'lodash/fp/flow';
import find from 'lodash/fp/find';
import map from 'lodash/fp/map';

import FrequencySelector from '../../selectors/FrequencySelector';
import logger from '../../../logger';
import {
  uniqStationFreqs,
  uniqStationLocations,
  uniqStationNames, uniqStationObsPeriods
} from '../../../utils/station-info';

import 'react-table/react-table.css';
import './StationMetadata.css';


logger.configure({ active: true });

const formatDate = d => d ? d.toISOString().substr(0,10) : 'unknown';


export default class StationMetadata extends Component {
  static propTypes = {
    stations: PropTypes.array,
    allNetworks: PropTypes.array.isRequired,
  };

  render() {
    const { stations, allNetworks, ...restProps } = this.props;

    const columns = [
      {
        id: 'Network',
        Header: 'Network',
        minWidth: 80,
        maxWidth: 100,
        accessor: station => {
          const network = find({ uri: station.network_uri })(allNetworks);
          return network ? network.name : '?';
        },
      },
      {
        id: 'Native ID',
        Header: 'Native ID',
        minWidth: 80,
        maxWidth: 100,
        accessor: 'native_id'
      },
      {
        id: 'Unique Name(s)',
        Header: 'Unique Name(s)',
        minWidth: 120,
        maxWidth: 200,
        accessor: station => (
          <ul className={"compact"}>
            {
              flow(
                uniqStationNames,
                map(name => (<li>{name}</li>)),
              )(station)
            }
          </ul>
        ),
      },
      {
        id: 'Unique Location(s)',
        Header: 'Unique Location(s)',
        minWidth: 120,
        maxWidth: 200,
        accessor: station => (
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
        ),
      },
      {
        id: 'Unique Record(s)',
        Header: 'Unique Record(s)',
        minWidth: 100,
        maxWidth: 200,
        accessor: station => (
          <ul className={"compact"}>
            {
              flow(
                uniqStationObsPeriods,
                map(period => (
                  <li>
                    {formatDate(period.min_obs_time)} to <br/>
                    {formatDate(period.max_obs_time)}
                  </li>
                )),
              )(station)
            }
          </ul>
        ),
      },
      {
        minWidth: 80,
        maxWidth: 100,
        id: 'Uniq Obs Freq',
        Header: 'Uniq Obs Freq',
        accessor: station => (
          <ul className={"compact"}>
            {
              flow(
                uniqStationFreqs,
                map(freq => (<li>{FrequencySelector.valueToLabel(freq)}</li>)),
              )(station.histories)
            }
          </ul>
        ),
      },
      {
        id: '# Hx',
        Header: '# Hx',
        minWidth: 50,
        maxWidth: 100,
        accessor: station => station.histories.length,
      },
    ];

    return (
      <ReactTable
        data={stations}
        columns={columns}
        defaultPageSize={100}
        {...restProps}
      />
    );
  }
}
