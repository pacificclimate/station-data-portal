// This component renders a table showing a selected subset of station metadata.
// This component wraps React Table v6. All props passed to this component are
// passed into React Table.

import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useTable, usePagination }  from 'react-table';
import { Table } from 'react-bootstrap';

import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';

import DownloadMetadata from '../../controls/DownloadMetadata';
import PaginationControls from '../../controls/PaginationControls';
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


function StationMetadata({ stations, allNetworks, allVariables }) {
  const columns = useMemo(
    () => [
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
            {map(name => (<li key={name}>{name}</li>), row.value)}
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
                map(location => (
                  // A location is a representative history item
                  <li key={location.id}>
                    {-location.lon} W <br/>
                    {location.lat} N <br/>
                    Elev. {location.elevation} m
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
                  // A period is a representative history item
                  <li key={period.id}>
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
            {map(freq => (<li key={freq}>{freq}</li>), row.value)}
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
            {map(name => (<li key={name}>{name}</li>), row.value)}
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
    ],
    [allNetworks, allVariables]
  );

  const {
    // Basic table functionality
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    visibleColumns,

    // Pagination
    // Instead of using `rows`, we use `page`,
    // which has only the rows for the active page
    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,

    // Know what's in state
    state: {
      // Pagination
      pageIndex,
      pageSize
    },
  } = useTable(
    {
      columns,
      data: stations,
      // Necessary when paging controls added?
      initialState: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
    usePagination,
  );

  const paginationControls = (
    <tr>
      <td colSpan={visibleColumns.length}>
        <PaginationControls
          {...{
            canPreviousPage,
            canNextPage,
            pageCount,
            pageIndex,
            gotoPage,
            nextPage,
            previousPage,
            pageSize,
            setPageSize,
          }}
        />
      </td>
    </tr>
  );

  // Note: Download button is rendered here because it uses `columns` to
  // control what it does.
  return (
    <div className={"StationMetadata"}>
      <DownloadMetadata
        data={stations}
        columns={columns}
      />
      <Table {...getTableProps()}>
        <thead>{paginationControls}</thead>
        <thead>
        {
          // Header rows
          headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {
                // Header cells
                headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>
                    {column.render('Header')}
                  </th>
                ))
              }
            </tr>
          ))
        }
        </thead>

        <tbody {...getTableBodyProps()}>
        {
          // Body rows
          page.map(row => {
            // Prepare the row for display
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {
                  // Body cells
                  row.cells.map(cell => {
                    return (
                      <td {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    )
                  })
                }
              </tr>
            )
          })
        }
        </tbody>
        <tfoot>{paginationControls}</tfoot>
      </Table>
    </div>
  );
}

StationMetadata.propTypes = {
  stations: PropTypes.array,
  allNetworks: PropTypes.array,
  allVariables: PropTypes.array,
};

export default StationMetadata;
