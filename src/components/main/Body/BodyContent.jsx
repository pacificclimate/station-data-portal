import React, { useState } from "react";
import { Button, Badge } from "react-bootstrap";
import { Table as TableIcon, Funnel } from "react-bootstrap-icons";
import StationMap from "@/components/maps/StationMap";
import NetworkLegend from "@/components/maps/NetworkLegend";
import StationWorkspacePanels from "./StationWorkspacePanels";
import { useStationsStore } from "@/state/client/stations-store";
import { useStationFilterSummary } from "@/state/client-server-hooks/use-station-filter-summary";
import css from "../common.module.css";
import "./BodyContent.css";

export const BodyContent = () => {
  const filterSummary = useStationFilterSummary();
  const [tableOpen, updateTableOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const setTableOpen = (open) => {
    updateTableOpen(open);
    if (open) setFiltersOpen(false);
  };
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
                  {filterSummary.total}
                </Badge>
              )}
            </Button>
          </nav>

          {legendOpen && <NetworkLegend onClose={() => setLegendOpen(false)} />}
        </div>
        <StationWorkspacePanels
          tableOpen={tableOpen}
          filtersOpen={filtersOpen}
          setTableOpen={setTableOpen}
          setFiltersOpen={setFiltersOpen}
        />
      </div>
    </div>
  );
};
