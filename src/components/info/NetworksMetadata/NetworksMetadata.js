// This component renders a table showing a selected subset of network metadata.
// This component wraps React Table v6. All props passed to this component are
// passed into React Table.

import PropTypes from 'prop-types';
import React from 'react';
import { Table } from 'react-bootstrap';
import { useSortBy, useTable } from 'react-table';
import logger from '../../../logger';
import chroma from 'chroma-js';
import './NetworksMetadata.css';
import { useStore } from '../../../state/state-store';


logger.configure({ active: true });

function NetworksMetadata({ networks }) {
  const config = useStore(state => state.config);

  const columns = React.useMemo(
    () => [
      {
        id: "Colour",
        Header: "",
        minWidth: 20,
        maxWidth: 20,
        disableSortBy: true,
        accessor: (network) => (
          <div
            style={{
              width: "1em",
              height: "1em",
              borderRadius: "0.5em",
              backgroundColor: chroma(
                network.color ?? config.defaultNetworkColor,
              ).css(),
            }}
          >
            &nbsp;
          </div>
        ),
      },
      {
        id: "Short Name",
        Header: "Short Name",
        minWidth: 80,
        maxWidth: 100,
        accessor: "name",
      },
      {
        id: "Long Name",
        Header: "Long Name",
        minWidth: 80,
        maxWidth: 400,
        accessor: "long_name",
      },
      {
        id: "# Stations",
        Header: "# Stations",
        minWidth: 80,
        maxWidth: 100,
        accessor: "station_count",
      },
    ],
    [config.defaultNetworkColor],
  );

  const data = React.useMemo(() => networks ?? [], [networks]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
        initialState: {
          sortBy: [{ id: "Short Name" }],
        },
      },
      useSortBy,
    );

  if (networks === null) {
    return "Loading...";
  }

  return (
    <div>
      <Table {...getTableProps()}>
        <thead>
          {
            // Header rows
            headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {
                  // Header cells
                  headerGroup.headers.map((column) => {
                    const sortClass = column.isSorted
                      ? column.isSortedDesc
                        ? "sorted-desc"
                        : "sorted-asc"
                      : "";
                    return (
                      <th
                        {...column.getHeaderProps({
                          ...column.getSortByToggleProps(),
                          className: sortClass,
                        })}
                      >
                        {column.render("Header")}
                      </th>
                    );
                  })
                }
              </tr>
            ))
          }
        </thead>

        <tbody {...getTableBodyProps()}>
          {
            // Body rows
            rows.map((row) => {
              // Prepare the row for display
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {
                    // Body cells
                    row.cells.map((cell) => {
                      return (
                        <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                      );
                    })
                  }
                </tr>
              );
            })
          }
        </tbody>
      </Table>
    </div>
  );
}

NetworksMetadata.propTypes = {
  networks: PropTypes.array,
};

export default NetworksMetadata;
