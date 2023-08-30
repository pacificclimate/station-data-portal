import PropTypes from 'prop-types';
import React from 'react';

import './FancyTable.css';
import { usePagination, useTable, useFilters } from 'react-table';
import { Table } from 'react-bootstrap';
import PaginationControls from '../../controls/PaginationControls';

function FancyTable({
  // Data to be displayed in table
  data,
  // Column definitions for table
  columns,
  // Hidden columns
  hiddenColumns = [],
  // Factory for defaultColumn argument to useTable (see note)
  makeDefaultColumn = () => {},
  // Factory for filterTypes argument to useTable (see note)
  makeFilterTypes = () => {},
}) {
  // Note: Several arguments to useTable are passed in from outside this
  // component, which endeavours to be a bit general. Some of those arguments
  // require memoizing with React.useMemo (see React Table documentation).
  // Memoization can only be done at the top level of a React component;
  // therefore we receive value factories, not memoized values, for these
  // arguments, and memoize them here.
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
      defaultColumn: React.useMemo(makeDefaultColumn, []),
      filterTypes: React.useMemo(makeFilterTypes, []),
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

FancyTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  hiddenColumns: PropTypes.array,
  makeDefaultColumn: PropTypes.func,
  makeFilterTypes: PropTypes.func,
};

export default FancyTable;
