import React, { useId } from "react";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import "./StationGroupingControl.css";

export default function StationGroupingControl({ compact, onChange }) {
  const id = useId();
  return (
    <ToggleButtonGroup
      type="radio"
      className="station-grouping-control"
      name={`station-grouping-${id}`}
      aria-label="Group stations"
      value={compact}
      onChange={onChange}
    >
      {[false, true].map((value) => (
        <ToggleButton
          id={`${id}-${value}`}
          key={String(value)}
          size="sm"
          variant="outline-success"
          value={value}
        >
          By {value ? "Station" : "History"}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
