import PropTypes from 'prop-types';
import React from 'react';

import './PaginatedTable.css';
import { usePagination, useTable, useFilters } from 'react-table';
import { Table } from 'react-bootstrap';
import PaginationControls from '../../controls/PaginationControls';

function filterName(id) {
  return {
    'startsWith': 'Starts with',
  }[id] || 'Contains'
}

// Define a default UI for filtering
function DefaultColumnFilter({
  column: { filter, filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length

  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
      }}
      placeholder={`(${count}) ${filterName(filter)} ...`}
    />
  )
}

function PaginatedTable({ data, columns, hiddenColumns = [] }) {
  const filterTypes = React.useMemo(
    () => ({
      startsWith: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id]
          return rowValue !== undefined
            ? String(rowValue)
            .toLowerCase()
            .startsWith(String(filterValue).toLowerCase())
            : true
        })
      },
    }),
    []
  )

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  )

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
      data,
      // Necessary when paging controls added?
      defaultColumn,
      filterTypes,
      initialState: {
        pageSize: 10,
        pageIndex: 0,
        hiddenColumns,
      },
    },
    useFilters,
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

  return (
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
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
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
  );
}

PaginatedTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  hiddenColumns: PropTypes.array,
};

export default PaginatedTable;
