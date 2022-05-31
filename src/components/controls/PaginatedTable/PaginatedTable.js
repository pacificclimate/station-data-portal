import PropTypes from 'prop-types';
import React from 'react';

import './PaginatedTable.css';
import { usePagination, useTable } from 'react-table';
import { Table } from 'react-bootstrap';
import PaginationControls from '../../controls/PaginationControls';

function PaginatedTable({ data, columns, hiddenColumns = [] }) {
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
      initialState: {
        pageSize: 10,
        pageIndex: 0,
        hiddenColumns,
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
