// This component renders a table showing a selected subset of network metadata.
// This component wraps React Table v6. All props passed to this component are
// passed into React Table.

import PropTypes from 'prop-types';
import React from 'react';
import { Table } from 'react-bootstrap';
import { useTable } from 'react-table';
import logger from '../../../logger';
import chroma from 'chroma-js';
import './NetworksMetadata.css';


logger.configure({ active: true });


function NetworksMetadata({ networks, defaultNetworkColor }) {
  const columns = React.useMemo(() => [
    {
      id: 'Colour',
      Header: '',
      minWidth: 20,
      maxWidth: 20,
      accessor: network => (
        <div style={{
          width: "1em",
          height: "1em",
          borderRadius: "0.5em",
          backgroundColor: chroma(
            network.color ?? defaultNetworkColor
          ).css(),
        }}>&nbsp;</div>
      )
    },
    {
      id: 'Short Name',
      Header: 'Short Name',
      minWidth: 80,
      maxWidth: 100,
      accessor: 'name'
    },
    {
      id: 'Long Name',
      Header: 'Long Name',
      minWidth: 80,
      maxWidth: 400,
      accessor: 'long_name'
    },
  ], [defaultNetworkColor]);

  const tableInstance = useTable({ columns, data: networks ?? [] });
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  if (networks === null) {
    return "Loading...";
  }

  return (
    <div>

    <Table {...getTableProps()}>
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
        rows.map(row => {
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
    </Table>
    </div>
  );
}

NetworksMetadata.propTypes = {
  networks: PropTypes.array,
  defaultNetworkColor: PropTypes.string,
};

NetworksMetadata.defaultProps = {
  defaultNetworkColor:
    process.env.REACT_APP_DEFAULT_NETWORK_COLOR ?? '#000000',
}

export default NetworksMetadata;
