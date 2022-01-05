// This component renders a table showing a selected subset of station metadata.
// This component wraps React Table v6. All props passed to this component are
// passed into React Table.

import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';

import DownloadMetadata from '../../controls/DownloadMetadata';
import FrequencySelector from '../../selectors/FrequencySelector';
import logger from '../../../logger';
import {
  stationNetwork,
  uniqStationFreqs,
  uniqStationLocations,
  uniqStationNames,
  uniqStationObsPeriods,
  uniqStationVariableNames
} from '../../../utils/station-info';

import 'react-table/react-table.css';
import './StationMetadata.css';


logger.configure({ active: true });

const formatDate = d => d ? d.toISOString().substr(0,10) : 'unknown';

// Comparator for standard lexicographic ordering of arrays of values.
// Returns negative, zero, or positive integer as usual for comparators.
// Uses the natural (<, >) ordering of the array elements. No guarantees if you
// supply it with arrays with different element types (pairwise by index). You
// have been warned.
const lexCompare = (a, b) => {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    if (a[i] < b[i]) {
      return -1;
    }
    if (a[i] > b[i]) {
      return 1;
    }
  }
  return a.length - b.length;
}


function StationMetadata({
  stations, allNetworks, allVariables, ...restProps
}) {
  const columns = [
    {
      id: 'Network',
      Header: 'Network',
      minWidth: 80,
      maxWidth: 100,
      accessor: station => {
        const network = stationNetwork(allNetworks, station);
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
      id: 'Unique Names',
      Header: 'Unique Names',
      minWidth: 120,
      maxWidth: 200,
      accessor: uniqStationNames,
      sortMethod: lexCompare,
      Cell: row => (
        <ul className={"compact"}>
          {map(name => (<li>{name}</li>), row.value)}
        </ul>
      ),
    },
    {
      id: 'Unique Locations',
      Header: 'Unique Locations',
      minWidth: 120,
      maxWidth: 200,
      sortable: false,
      accessor: uniqStationLocations,
      Cell: row => (
        <ul className={"compact"}>
          {
              map(loc => (
                <li>
                  {-loc.lon} W <br/>
                  {loc.lat} N <br/>
                  Elev. {loc.elevation} m
                </li>
              ), row.value)
          }
        </ul>
      ),
    },
    {
      id: 'Unique Records',
      Header: 'Unique Records',
      minWidth: 100,
      maxWidth: 100,
      sortable: false,
      accessor: uniqStationObsPeriods,
      Cell: row => (
        <ul className={"compact"}>
          {
              map(period => (
                <li>
                  {formatDate(period.min_obs_time)} to <br/>
                  {formatDate(period.max_obs_time)}
                </li>
              ), row.value)
          }
        </ul>
      ),
    },
    {
      minWidth: 80,
      maxWidth: 100,
      id: 'Uniq Obs Freqs',
      Header: 'Uniq Obs Freqs',
      accessor: flow(uniqStationFreqs, map(FrequencySelector.valueToLabel)),
      sortMethod: lexCompare,
      Cell: row => (
        <ul className={"compact"}>
          {map(freq => (<li>{freq}</li>), row.value)}
        </ul>
      ),
    },
    {
      minWidth: 100,
      maxWidth: 250,
      id: 'Variables',
      Header: 'Variables',
      accessor: uniqStationVariableNames(allVariables),
      sortable: false,
      Cell: row => (
        <ul className={"compact"}>
          {map(name => (<li>{name}</li>), row.value)}
        </ul>
      ),
    },
    {
      id: '# Hx',
      Header: '# Hx',
      minWidth: 30,
      maxWidth: 30,
      accessor: station => station.histories.length,
    },
  ];

  // Note: Download button is placed here because it should use the same
  // formatting as React Table, i.e., what is defined in `columns`. It's too
  // bad that React Table doesn't provide an export feature.
  return (
    <React.Fragment>
      <DownloadMetadata
        data={stations}
        columns={columns}
      />
      <ReactTable
        data={stations}
        columns={columns}
        defaultPageSize={100}
        {...restProps}
      />
    </React.Fragment>
  );
}

StationMetadata.propTypes = {
  stations: PropTypes.array,
  allNetworks: PropTypes.array.isRequired,
  allVariables: PropTypes.array.isRequired,
};

export default StationMetadata;
