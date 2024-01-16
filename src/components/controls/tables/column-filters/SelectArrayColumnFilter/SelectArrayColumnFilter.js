import React from "react";
import Form from "react-bootstrap/Form";
import ClearButton from "../../misc/ClearButton";
import styles from "../ColumnFilters.module.css";
import sortBy from "lodash/fp/sortBy";

// Custom filter UI for selecting a unique option from set of rows, whose
// values are a list that contains an array of option values. (Typically this
// array coalesces information about a list of sub-objects associated with the
// row.) Basically, collect all the unique option values and make a selector
// out of them. The rows in question are those already filtered by other column
// selectors, which are given by `column.preFilteredRows`.

export default function SelectArrayColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
  toString = (option) => option.toString(),
  allValue = "*",
}) {
  // Calculate the options for filtering using the preFilteredRows.
  // The row values themselves are arrays, and each array element is added
  // to the list of options.
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      row.values[id].forEach((value) => {
        options.add(value);
      });
    });
    return sortBy((x) => x, [...options.values()]);
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return (
    <div className={`${styles.wrapper} ${styles.selectArrayColumn}`}>
      <Form.Control
        size="sm"
        as="select"
        value={filterValue}
        onChange={(e) => {
          setFilter(e.target.value || undefined);
        }}
      >
        <option value={allValue}>All</option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {toString(option)}
          </option>
        ))}
      </Form.Control>
    </div>
  );
}
