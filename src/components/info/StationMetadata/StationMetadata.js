// This component renders a table showing a selected subset of station metadata.
// This component wraps React Table v6. All props passed to this component are
// passed into React Table.

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactTable from 'react-table';

import flow from 'lodash/fp/flow';
import find from 'lodash/fp/find';
import map from 'lodash/fp/map';
import uniq from 'lodash/fp/uniq';
import uniqWith from 'lodash/fp/uniqWith';

import FrequencySelector from '../../selectors/FrequencySelector';
import logger from '../../../logger';
import { utcDateOnly } from '../../../utils/portals-common';

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
                map('station_name'),
                uniq,
                map(name => (<li>{name}</li>)),
              )(station.histories)
            }
          </ul>
        ),
        // accessor: station => station.histories[0].station_name,
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
                uniqWith(
                  (hx1, hx2) => hx1.lon === hx2.lon && hx1.lat === hx2.lat
                ),
                map(hx => (
                  <li>
                    {-hx.lon} W <br/>
                    {hx.lat} N <br/>
                    Elev. {hx.elevation} m
                  </li>
                )),
              )(station.histories)
            }
          </ul>
        ),
        // accessor: station => {
        //   const hx = station.histories[0];
        //   return (
        //     <div>
        //       {-hx.lon} W <br/>
        //       {hx.lat} N <br/>
        //       Elev. {hx.elevation} m
        //     </div>
        //   );
        // }
      },
      {
        id: 'Unique Record(s)',
        Header: 'Unique Record(s)',
        minWidth: 100,
        maxWidth: 200,
        // accessor: station => 'record',
        accessor: station => (
          <ul className={"compact"}>
            {
              flow(
                uniqWith(
                  (hx1, hx2) =>
                    utcDateOnly(hx1.min_obs_time).getTime()
                      === utcDateOnly(hx2.min_obs_time).getTime()
                    && utcDateOnly(hx1.max_obs_time).getTime()
                      === utcDateOnly(hx2.max_obs_time).getTime()
                ),
                map(hx => (
                  <li>
                    {formatDate(hx.min_obs_time)} to <br/>
                    {formatDate(hx.max_obs_time)}
                  </li>
                )),
              )(station.histories)
            }
          </ul>
        ),
        // accessor: station => {
        //   return (
        //   <div>
        //     {formatDate(station.min_obs_time)} to <br/>
        //     {formatDate(station.max_obs_time)}
        //   </div>
        // )}
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
                map('freq'),
                uniq,
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
