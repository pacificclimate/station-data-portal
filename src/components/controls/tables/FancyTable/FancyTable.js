import PropTypes from 'prop-types';
import React from 'react';

import './FancyTable.css';
import { usePagination, useTable, useFilters } from 'react-table';
import { Table } from 'react-bootstrap';
import { flow, map, min, max } from 'lodash/fp';
import PaginationControls from '../../../controls/tables/PaginationControls';

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

  const filterCounts = flow(
    map(col => col.preFilteredRows.length),
    (ls => ({ min: min(ls), max: max(ls)})),
  )(headerGroups[0].headers);

  return (
    <Table {...getTableProps()}>
      <thead>{paginationControls}</thead>

      <thead>

      {/* Global column search count */}
      <tr {...headerGroups[0].getHeaderGroupProps()}>
        <td colSpan={visibleColumns.length}>
          {`Showing ${filterCounts.min} of ${filterCounts.max} rows ...`}
        </td>
      </tr>

      {/* Individual column search counts */}
      {/*<tr {...headerGroups[0].getHeaderGroupProps()}>*/}
      {/*  {*/}
      {/*    headerGroups[0].headers.map(column => (*/}
      {/*      <td>{column.render('ColumnSearchCount')}</td>*/}
      {/*    ))*/}
      {/*  }*/}
      {/*</tr>*/}

      {
        // Column labels
        headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {
              // Label cells
              headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>
                  {column.render('Header')}
                </th>
              ))
            }
          </tr>
        ))
      }
      {
        // Column filters
        headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {
              headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>
                  {/* For some godforsaken reason, the standard column prop
                  canFilter is always true, no matter how or where it's set.
                  We use a custom prop doFilter, which behaves as expected. */}
                  <div>{
                    column.doFilter
                      ? column.render('Filter')
                      : <em>No filtering</em>}</div>
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
