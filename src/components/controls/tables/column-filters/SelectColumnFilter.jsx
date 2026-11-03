import React from "react";
import Form from "react-bootstrap/Form";
import styles from "./ColumnFilters.module.css";
import sortBy from "lodash/fp/sortBy";

// Custom filter UI for selecting a unique option from a list

export default function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
  allValue = "*",
  autoSelectSingle = false,
}) {
  // Calculate the options for filtering using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      if (row.values[id] !== allValue) options.add(row.values[id]);
    });
    return sortBy((x) => x, [...options.values()]);
  }, [id, preFilteredRows, allValue]);

  const singleOption = autoSelectSingle && options.length === 1;
  React.useEffect(() => {
    // Every row already has this value. Avoid a redundant station constraint,
    // and clear a stale choice if the available province changes.
    if (singleOption && filterValue !== undefined) setFilter(undefined);
  }, [singleOption, options, filterValue, setFilter]);

  // Render a multi-select box
  return (
    <div className={`${styles.wrapper} ${styles.selectColumn}`}>
      <Form.Select
        value={singleOption ? options[0] : (filterValue ?? allValue)}
        disabled={singleOption}
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
