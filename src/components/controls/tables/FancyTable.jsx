import PropTypes from "prop-types";
import isEqual from "lodash/isEqual";
import { activeAttributeFilters } from "@/utils/station-filter-summary";
import React, { useState, useRef, useEffect } from "react";

import styles from "./FancyTable.module.css";
import { usePagination, useTable, useFilters } from "react-table";
import { Funnel } from "react-bootstrap-icons";
import { Table, Button, Modal, Badge } from "react-bootstrap";
import { flow, map, min, max } from "lodash/fp";
import PaginationControls from "./PaginationControls";
import NoColumnFilter from "./column-filters/NoColumnFilter";

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
  filterPresentation = "inline",
  toolbar,
  initialFilters = [],
  syncFilters = false,
  onFiltersChange,
  onOpenFilters,
  filterSummary,
  filterOnly = false,
  filterContent,
  onCloseFilters,
  renderToolbar,
  // All additional props are passed through to the React Bootstrap Table.
  ...restOfProps
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const savedFilters = useRef([]);
  const dialogFilters = filterPresentation === "dialog";
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
    allColumns,
    rows,
    setAllFilters,

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
      pageSize,
      filters,
    },
  } = useTable(
    {
      columns,
      data,
      defaultColumn: React.useMemo(() => defaultColumn, []),
      filterTypes: React.useMemo(() => filterTypes, []),
      autoResetFilters: !dialogFilters,
      initialState: {
        filters: initialFilters,
        pageSize: 10,
        pageIndex: 0,
        hiddenColumns,
      },
    },
    useFilters,
    usePagination,
  );

  const publishedFilters = useRef(initialFilters);
  const observedFilters = useRef(filters);
  useEffect(() => {
    if (syncFilters && !isEqual(initialFilters, publishedFilters.current)) {
      publishedFilters.current = initialFilters;
      setAllFilters(initialFilters);
    }
  }, [syncFilters, initialFilters, setAllFilters]);
  useEffect(() => {
    if (!syncFilters) {
      onFiltersChange?.(filters);
    } else if (filters !== observedFilters.current) {
      observedFilters.current = filters;
      if (!isEqual(filters, publishedFilters.current)) {
        publishedFilters.current = filters;
        onFiltersChange?.(filters);
      }
    }
  }, [filters, onFiltersChange, syncFilters]);
  // Pagination controls are used in header and footer.
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
          className="justify-content-center"
        />
      </td>
    </tr>
  );

  const filterCounts = flow(
    map((col) => col.preFilteredRows.length),
    (ls) => ({ min: min(ls), max: max(ls) }),
  )(headerGroups[0].headers);
  const attributeCount = activeAttributeFilters(filters).length;
  const criteriaCount = filterSummary?.criteriaCount ?? 0;
  const activeFilterCount = criteriaCount + attributeCount;
  const filterDescription = `${criteriaCount} station criteria and ${attributeCount} attribute filters active`;

  const filterFields = (
    <div className="table-filter-fields">
      {allColumns
        .filter(
          (column) =>
            column.doFilter &&
            !column.hideFilter &&
            (column.isVisible || column.filterWhenHidden),
        )
        .map((column) => (
          <fieldset className="table-filter-field" key={column.id}>
            <legend>{column.render("Header")}</legend>
            {column.render("Filter")}
          </fieldset>
        ))}
    </div>
  );
  const attributeFields = (
    <>
      <h2 className="h5">
        {filterSummary?.viewLabel ?? "Station"} attributes{" "}
        <Badge bg="secondary">{attributeCount}</Badge>
      </h2>
      {filterSummary && (
        <p className="text-muted">
          Attribute filters are saved separately for each table view.
          {filterSummary.otherViewCount > 0 &&
            ` ${filterSummary.otherViewLabel} has ${filterSummary.otherViewCount} saved attribute ${filterSummary.otherViewCount === 1 ? "filter" : "filters"}, applied when you switch to that view.`}
        </p>
      )}
      {filterFields}
    </>
  );
  if (filterOnly)
    return (
      <div className="station-unified-filters">
        <h2 className="h5">
          Station criteria <Badge bg="secondary">{criteriaCount}</Badge>
        </h2>
        <p className="text-muted">
          Shared across both table views. Changes update the map and table
          immediately.
        </p>
        {filterSummary?.criteria.length > 0 && (
          <p className="station-active-filter-summary">
            Active: {filterSummary.criteria.join(", ")}
          </p>
        )}
        {filterContent
          ? React.cloneElement(filterContent, {}, attributeFields)
          : attributeFields}
        <p className="mt-3" role="status">
          {rows.length} matching rows
        </p>
        <div className="d-flex flex-wrap gap-2">
          {!filterContent && (
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => setAllFilters([])}
            >
              Clear attribute filters
            </Button>
          )}
          <Button size="sm" className="ms-auto" onClick={onCloseFilters}>
            Done
          </Button>
        </div>
      </div>
    );

  const cancelFilters = () => {
    setAllFilters(savedFilters.current);
    setFiltersOpen(false);
  };
  const filterButton = (
    <Button
      size="sm"
      variant={activeFilterCount ? "success" : "outline-secondary"}
      onClick={() => {
        if (onOpenFilters) {
          onOpenFilters();
          return;
        }
        savedFilters.current = filters;
        setFiltersOpen(true);
      }}
      title={filterSummary ? filterDescription : "Filter table rows"}
    >
      <Funnel aria-hidden="true" /> Filters{" "}
      {activeFilterCount > 0 && (
        <Badge bg="light" text="dark">
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );
  return (
    <>
      {dialogFilters && (
        <div className="table-view-toolbar">
          {renderToolbar ? (
            renderToolbar({
              rows: rows.map((row) => row.original),
              filterButton,
            })
          ) : (
            <>
              {filterButton}
              {toolbar}
              <span className="table-view-count" role="status">
                Showing {rows.length} of {data.length} rows
              </span>
            </>
          )}
        </div>
      )}
      {dialogFilters && !onOpenFilters && (
        <Modal
          show={filtersOpen}
          onHide={cancelFilters}
          aria-labelledby="table-filters-title"
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="table-filters-title">
              Filter station metadata
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted">
              Match station attributes using the fields below. These filters
              affect table rows.
            </p>
            {filterFields}
            <p className="mt-3 mb-0" role="status">
              {rows.length} matching rows
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="sm"
              variant="outline-danger"
              className="me-auto"
              onClick={() => setAllFilters([])}
            >
              Clear filters
            </Button>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={cancelFilters}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setFiltersOpen(false)}
            >
              Apply
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      <Table {...{ ...getTableProps(), ...restOfProps }}>
        {!dialogFilters && <thead>{paginationControls}</thead>}

        <thead>
          {/* Column filtering global row count */}
          {!dialogFilters && (
            <tr {...headerGroups[0].getHeaderGroupProps()}>
              <td colSpan={visibleColumns.length}>
                {`Filters: Showing ${filterCounts.min} of ${filterCounts.max} rows ...`}
              </td>
            </tr>
          )}

          {
            // Column labels
            headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {
                  // Label cells
                  headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps({
                        className: column.className,
                      })}
                    >
                      {column.render("Header")}
                    </th>
                  ))
                }
              </tr>
            ))
          }
          {
            // Column filters
            !dialogFilters &&
              headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <td {...column.getHeaderProps()}>
                      {/* For some godforsaken reason, the standard column prop
                  canFilter is always true, no matter how or where it's set.
                  We use a custom prop doFilter, which behaves as expected. */}
                      <div>
                        {column.hideFilter ? null : column.doFilter ? (
                          column.render("Filter")
                        ) : (
                          <NoColumnFilter size={10} />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
          }
        </thead>

        <tbody {...getTableBodyProps()} className={styles.scrolling}>
          {page.length === 0 && (
            <tr>
              <td colSpan={visibleColumns.length} className="text-muted py-3">
                No rows match the current view.
              </td>
            </tr>
          )}
          {
            // Body rows
            page.map((row) => {
              // Prepare the row for display
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {
                    // Body cells
                    row.cells.map((cell) => {
                      return (
                        <td
                          {...cell.getCellProps({
                            className: cell.column.className,
                          })}
                        >
                          {cell.render("Cell")}
                        </td>
                      );
                    })
                  }
                </tr>
              );
            })
          }
        </tbody>
        <tfoot>{paginationControls}</tfoot>
      </Table>
    </>
  );
}

FancyTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  hiddenColumns: PropTypes.array,
  filterPresentation: PropTypes.oneOf(["inline", "dialog"]),
  toolbar: PropTypes.node,
  initialFilters: PropTypes.array,
  syncFilters: PropTypes.bool,
  onFiltersChange: PropTypes.func,
  onOpenFilters: PropTypes.func,
  filterSummary: PropTypes.object,
  filterOnly: PropTypes.bool,
  filterContent: PropTypes.node,
  onCloseFilters: PropTypes.func,
  renderToolbar: PropTypes.func,
  defaultColumn: PropTypes.object,
  filterTypes: PropTypes.object,
};

export default FancyTable;
