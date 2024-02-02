import React from "react";
import Form from "react-bootstrap/Form";
import { makeFilterNumberInputOnChange } from "../../../../utils/filters";
import ClearButton from "../../misc/ClearButton/ClearButton";
import styles from "../ColumnFilters.module.css";

// Custom UI for selecting a coordinates (lat, lon pair) near given coordinates.

export default function CoordinatesNearColumnFilter({
  column: { filterValue = [undefined, undefined, undefined], setFilter },
}) {
  return (
    <div className={`${styles.wrapper} ${styles.coordinates}`}>
      <Form.Control
        className={styles.control}
        size="sm"
        htmlSize={6}
        type="number"
        value={filterValue[0] || ""}
        onChange={makeFilterNumberInputOnChange({ filterValue, setFilter }, 0)}
        placeholder={`Lat`}
      />
      <Form.Control
        className={styles.control}
        size="sm"
        htmlSize={6}
        type="number"
        value={filterValue[1] || ""}
        onChange={makeFilterNumberInputOnChange({ filterValue, setFilter }, 1)}
        placeholder={`Lon`}
      />
      ±
      <Form.Control
        className={`${styles.control} ${styles.radius}`}
        style={{
          marginLeft: "0.5em",
        }}
        size="sm"
        htmlSize={4}
        type="number"
        value={filterValue[2] || 10}
        min={0}
        step={5}
        onChange={makeFilterNumberInputOnChange({ filterValue, setFilter }, 2)}
        placeholder={`Radius (km)`}
      />
      km
      <ClearButton setFilter={setFilter} />
    </div>
  );
}
