import React, { useRef, useEffect, useState } from "react";
import { Button, Badge, CloseButton } from "react-bootstrap";
import {
  Table as TableIcon,
  Funnel,
  QuestionCircle,
} from "react-bootstrap-icons";
import StationMap from "@/components/maps/StationMap";
import NetworkLegend from "@/components/maps/NetworkLegend";
import StationMetadata, {
  StationDownloads,
} from "@/components/info/StationMetadata";
import { useStationsStore } from "@/state/client/stations-store";
import { Outlet } from "react-router-dom";
import { useWorkspaceUrlState } from "@/state/client-server-hooks/use-workspace-url-state";
import { useStationFilterSummary } from "@/state/client-server-hooks/use-station-filter-summary";
import css from "../common.module.css";
import "./BodyContent.css";

export const BodyContent = () => {
  const [helpVisible, setHelpVisible] = useState(false);
  const filterSummary = useStationFilterSummary();
  const {
    tableOpen,
    setTableOpen,
    filtersOpen,
    setFiltersOpen,
    legendOpen,
    setLegendOpen,
  } = useWorkspaceUrlState();
  const filtersDialog = useRef(null);
  useEffect(() => {
    if (!filtersOpen) return;
    const trigger = document.activeElement;
    filtersDialog.current?.focus();
    return () => {
      if (trigger?.isConnected) trigger.focus();
    };
  }, [filtersOpen]);
  const selectedCount = useStationsStore(
    (state) => state.downloadStations.length,
  );

  return (
    <div className={css.portal}>
      <div className="station-workspace">
        <div className="station-map-workspace">
          <StationMap />
          <nav className="station-map-toolbar" aria-label="Station tools">
            <Button
              variant="light"
              aria-label="Table"
              title="Station table"
              aria-expanded={tableOpen && !filtersOpen}
              onClick={() => setTableOpen(!(tableOpen && !filtersOpen))}
            >
              <TableIcon aria-hidden="true" />
              {selectedCount > 0 && (
                <Badge bg="success" aria-hidden="true">
                  {selectedCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="light"
              onClick={() => setLegendOpen(!legendOpen)}
              aria-label="Network legend"
              title="Network legend"
              aria-expanded={legendOpen}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="5" cy="5" r="2.5" fill="#df5353" />
                <circle cx="5" cy="12" r="2.5" fill="#2ca96d" />
                <circle cx="5" cy="19" r="2.5" fill="#3984d6" />
                <path
                  d="M11 5h10M11 12h10M11 19h10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </Button>
            <Button
              variant="light"
              aria-label="Filters"
              title={`Station filters: ${filterSummary.criteriaCount} criteria, ${filterSummary.attributeCount} attributes`}
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <Funnel aria-hidden="true" />
              {filterSummary.total > 0 && (
                <Badge bg="success" aria-hidden="true">
                  •
                </Badge>
              )}
            </Button>
          </nav>

          {legendOpen && <NetworkLegend onClose={() => setLegendOpen(false)} />}
          {(!tableOpen || filtersOpen) && (
            <div
              className="station-map-downloads"
              role="group"
              aria-label="Downloads"
            >
              <StationDownloads />
            </div>
          )}
        </div>
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
      </div>
      <Outlet />
    </div>
  );
};
