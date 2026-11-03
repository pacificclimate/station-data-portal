import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Button, CloseButton } from "react-bootstrap";
import { QuestionCircle } from "react-bootstrap-icons";
import StationMetadata from "@/components/info/StationMetadata";

export default function StationWorkspacePanels({
  tableOpen,
  filtersOpen,
  setTableOpen,
  setFiltersOpen,
}) {
  const [helpVisible, setHelpVisible] = useState(false);
  const filtersDialog = useRef(null);
  useEffect(() => {
    if (!filtersOpen) return;
    const trigger = document.activeElement;
    filtersDialog.current?.focus();
    return () => {
      if (trigger?.isConnected) trigger.focus();
    };
  }, [filtersOpen]);

  return (
    <aside
      className="station-side-panel"
      hidden={!tableOpen && !filtersOpen}
      aria-label="Station workspace"
    >
      <section
        ref={filtersDialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="false"
        aria-labelledby="station-filters-title"
        className="station-filters-pane"
        hidden={!filtersOpen}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !event.defaultPrevented)
            setFiltersOpen(false);
        }}
      >
        {filtersOpen && (
          <>
            <div className="modal-header">
              <h2 className="modal-title h5" id="station-filters-title">
                Station filters
              </h2>
              <CloseButton
                aria-label="Close filters"
                onClick={() => setFiltersOpen(false)}
              />
            </div>
            <div className="modal-body">
              <StationMetadata
                filterOnly
                onCloseFilters={() => setFiltersOpen(false)}
              />
            </div>
          </>
        )}
      </section>
      <section
        className="station-table-pane"
        hidden={!tableOpen || filtersOpen}
        aria-label="Station table"
      >
        {tableOpen && (
          <>
            <header className="station-panel-heading">
              <div className="station-table-title">
                <h2>Station table</h2>
                <Button
                  size="sm"
                  variant="link"
                  aria-label="Station table help"
                  title="Station table help"
                  aria-expanded={helpVisible}
                  aria-controls="station-table-help"
                  onClick={() => setHelpVisible(!helpVisible)}
                >
                  <QuestionCircle aria-hidden="true" />
                </Button>
              </div>
              <CloseButton
                aria-label="Close panel"
                onClick={() => setTableOpen(false)}
              />
            </header>
            <div className="station-panel-content">
              <StationMetadata
                helpVisible={helpVisible}
                onOpenFilters={() => setFiltersOpen(!filtersOpen)}
              />
            </div>
          </>
        )}
      </section>
    </aside>
  );
}

StationWorkspacePanels.propTypes = {
  tableOpen: PropTypes.bool.isRequired,
  filtersOpen: PropTypes.bool.isRequired,
  setTableOpen: PropTypes.func.isRequired,
  setFiltersOpen: PropTypes.func.isRequired,
};
