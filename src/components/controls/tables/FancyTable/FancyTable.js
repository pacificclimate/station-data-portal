import PropTypes from 'prop-types';
import React from 'react';

import styles from './FancyTable.module.css';
import { usePagination, useTable, useFilters } from 'react-table';
import { Table } from 'react-bootstrap';
import { flow, map, min, max } from 'lodash/fp';
import PaginationControls from '../PaginationControls';
import NoColumnFilter from '../column-filters/NoColumnFilter';

function FancyTable({
  // Data to be displayed in table
  data,
  // Column definitions for table
  columns,
  // Hidden columns
  hiddenColumns = [],
  // Value for defaultColumn argument to useTable (see note)
  defaultColumn = {},
  // Value for filterTypes argument to useTable (see note)
  filterTypes = () => {},
}) {
  // Note: Several arguments to useTable are passed in from outside this
  // component, which endeavours to be a bit general. Some of those arguments
  // require memoizing with React.useMemo (see React Table documentation).
  // Memoization can only be done at the top level of a React component;
  // therefore they are memoized inside this component.
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
      defaultColumn: React.useMemo(() => defaultColumn, []),
      filterTypes: React.useMemo(() => filterTypes, []),
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
          variant={"success"}
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
                <td {...column.getHeaderProps()}>
                  {/* For some godforsaken reason, the standard column prop
                  canFilter is always true, no matter how or where it's set.
                  We use a custom prop doFilter, which behaves as expected. */}
                  <div>{
                    column.doFilter
                      ? column.render('Filter')
                      : <NoColumnFilter size={10}/>
                  }</div>
                </td>
              ))
            }
          </tr>
        ))
      }
      </thead>

      <tbody {...getTableBodyProps()} className={styles.scrolling}>
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
  defaultColumn: PropTypes.func,
  filterTypes: PropTypes.func,
};

export default FancyTable;
