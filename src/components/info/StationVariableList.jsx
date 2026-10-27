import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";
import "./StationVariableList.css";

export default function StationVariableList({ names }) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = names.length > 3;
  return (
    <div className={`station-variable-cell${expanded ? " is-expanded" : ""}`}>
      <ul className="station-variable-list">
        {(expanded ? names : names.slice(0, 3)).map((name) => (
          <li key={name} title={name}>
            {name}
          </li>
        ))}
      </ul>
      {canExpand && (
        <button
          type="button"
          className="station-variable-toggle"
          aria-expanded={expanded}
          aria-label={
            expanded
              ? "Show fewer variables"
              : `Show all ${names.length} variables`
          }
          title={
            expanded
              ? "Collapse variables"
              : `Show ${names.length - 3} more variables`
          }
          onClick={() => setExpanded(!expanded)}
        >
          {!expanded && <span>+{names.length - 3}</span>}
          {expanded ? (
            <ChevronUp aria-hidden="true" />
          ) : (
            <ChevronDown aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}
