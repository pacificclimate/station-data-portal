import React from "react";
import Form from "react-bootstrap/Form";
import styles from "../ColumnFilters.module.css";
import sortBy from "lodash/fp/sortBy";

// Custom filter UI for selecting a unique option from a list

export default function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
  allValue = "*",
}) {
  // Calculate the options for filtering using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return sortBy((x) => x, [...options.values()]);
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return (
    <div className={`${styles.wrapper} ${styles.selectColumn}`}>
      <Form.Select
        value={filterValue}
        onChange={(e) => {
          setFilter(e.target.value || undefined);
        }}
        size="sm"
      >
        <option value={allValue}>All</option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </Form.Select>
    </div>
  );
}
