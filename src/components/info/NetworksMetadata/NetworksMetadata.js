// This component renders a table showing a selected subset of network metadata.
// This component wraps React Table v6. All props passed to this component are
// passed into React Table.

import PropTypes from "prop-types";
import React from "react";
import { Table } from "react-bootstrap";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import logger from "@/logger";
import { useNetworks } from "@/state/query-hooks/use-networks";
import useConfigContext from "@/state/context-hooks/use-config-context";
import { NetworkSpot } from "./NetworkSpot";

import "./NetworksMetadata.css";

logger.configure({ active: true });

function NetworksMetadata() {
  const config = useConfigContext();
  const { data: networks, isLoading, isError } = useNetworks();

  const [sorting, setSorting] = React.useState([]);

  const networkRenderer = (info) => (
    <NetworkSpot color={info.getValue() ?? config.defaultNetworkColor} />
  );

  const columns = React.useMemo(
    () => [
      {
        id: "network_spot",
        header: "",
        minWidth: 20,
        maxWidth: 20,
        accessorKey: "color",
        cell: networkRenderer,
      },
      {
        header: "Short Name",
        minWidth: 80,
        maxWidth: 100,
        accessorKey: "name",
      },
      {
        header: "Long Name",
        minWidth: 80,
        maxWidth: 400,
        accessorKey: "long_name",
      },
      {
        header: "# Stations",
        minWidth: 80,
        maxWidth: 100,
        accessorKey: "station_count",
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: networks ?? [],
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return "Loading...";
  }

  console.log("### NetworksMetadata", table.getRowModel(), networks);

  const getSortedCssClass = (column) => {
    const classes = [];
    if (!column.getCanSort()) {
      return "";
    }
    classes.push("cursor-pointer select-none");
    classes.push(`sorted-${column.getIsSorted().toString()}`);
    return classes.join(" ");
  };

  return (
    <div>
      <Table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        className: getSortedCssClass(header.column),
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default NetworksMetadata;
