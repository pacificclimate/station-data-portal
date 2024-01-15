import React from "react";
import Form from "react-bootstrap/Form";
import ClearButton from "../../misc/ClearButton";
import { filterName } from "../../filterTypes";
import styles from "../ColumnFilters.module.css";

// Default UI for column filtering
export default function DefaultColumnFilter({
  column: { filter, filterValue, setFilter },
  size,
}) {
  return (
    <div className={`${styles.wrapper} ${styles.default}`}>
      <Form.Control
        size="sm"
        htmlSize={size}
        value={filterValue || ""}
        onChange={(e) => {
          setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
        }}
        placeholder={`${filterName(filter)} ...`}
      />
      <ClearButton setFilter={setFilter} />
    </div>
  );
}
