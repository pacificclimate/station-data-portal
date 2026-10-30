import React, { useState } from "react";
import Select from "react-select";
import { Button, Col, Dropdown, Row, Tab, Tabs } from "react-bootstrap";
import { useShallow } from "zustand/react/shallow";
import pick from "lodash/fp/pick";

import SelectionCounts from "@/components/info/SelectionCounts";
import StationGroupingControl from "./StationGroupingControl";
import IncludeStationsWithNoObsControl from "./IncludeStationsWithNoObsControl";
import NetworkSelector from "@/components/selectors/NetworkSelector";
import VariableSelector from "@/components/selectors/VariableSelector";
import FrequencySelector from "@/components/selectors/FrequencySelector";
import DateSelector from "@/components/selectors/DateSelector";
import OnlyWithClimatologyControl from "./OnlyWithClimatologyControl";
import { useStationsStore } from "@/state/client/stations-store";
import { useStore } from "@/state/client/state-store";
import { useConfigContext } from "@/state/context-hooks/use-config-context";
import { useStationFilterSummary } from "@/state/client-server-hooks/use-station-filter-summary";
import { useNetworks } from "@/state/query-hooks/use-networks";
import { useVariables } from "@/state/query-hooks/use-variables";
import { useFrequencies } from "@/state/query-hooks/use-frequencies";
import "./StationFilters.css";

function StationFilters({ children }) {
  const config = useConfigContext();
  const [activeTab, setActiveTab] = useState("networks");
  const { data: networks } = useNetworks();
  const { data: variables } = useVariables();
  const { data: frequencies } = useFrequencies();
  const reset = useStationsStore((state) => state.resetStationFilters);
  const compact = useStationsStore((state) => state.metadataCompact);
  const setCompact = useStationsStore((state) => state.setMetadataCompact);
  const tabLabels = {
    networks: "Networks",
    variables: "Variables",
    observations: "Observations",
    dates: "Dates",
    area: "Area",
    attributes: "Attributes",
  };
  const ready = {
    all: Boolean(networks && variables && frequencies),
    networks: Boolean(networks),
    variables: Boolean(variables),
    observations: Boolean(frequencies),
    dates: true,
    area: true,
    attributes: true,
  };

  const summary = useStationFilterSummary();
  const { startDate, endDate, setStartDate, setEndDate, area, setArea } =
    useStationsStore(
      useShallow(
        pick([
          "startDate",
          "endDate",
          "setStartDate",
          "setEndDate",
          "area",
          "setArea",
        ]),
      ),
    );
  const { stationsLimit, setStationsLimit } = useStore(
    useShallow(pick(["stationsLimit", "setStationsLimit"])),
  );
  const title = (label, criteria) => {
    const count = summary.criteria.filter((name) =>
      criteria.includes(name),
    ).length;
    return (
      <>
        {label}
        {count > 0 && (
          <>
            {" "}
            <span className="text-success">
              <span aria-hidden="true">•</span>
              <span className="visually-hidden">{count}</span>
            </span>
          </>
        )}
      </>
    );
  };
  return (
    <div className="station-filter-tabs">
      {config.stationDebugFetchOptions && (
        <div className="mb-3">
          <label>Fetch limit</label>
          <Select
            options={config.stationDebugFetchLimitsOptions}
            value={stationsLimit}
            onChange={setStationsLimit}
          />
        </div>
      )}
      <div className="station-filter-tools">
        <SelectionCounts />
        <Dropdown>
          <Dropdown.Toggle
            size="sm"
            variant="outline-secondary"
            id="clear-station-filters"
          >
            Clear
          </Dropdown.Toggle>
          <Dropdown.Menu align="end">
            <Dropdown.Item
              as="button"
              disabled={!ready.all}
              onClick={() => reset("all", { networks, variables, frequencies })}
              aria-label="Clear all filters"
            >
              All
            </Dropdown.Item>
            <Dropdown.Item
              as="button"
              disabled={!ready[activeTab]}
              onClick={() =>
                reset(activeTab, { networks, variables, frequencies })
              }
              aria-label={`Clear ${tabLabels[activeTab]} filters`}
            >
              {tabLabels[activeTab]}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <div className="station-filter-grouping">
        <span>Group stations</span>
        <StationGroupingControl compact={compact} onChange={setCompact} />
      </div>
      <p className="small text-muted">
        Station criteria apply to both views. Attributes are saved separately
        for each view.
      </p>
      <Tabs
        id="station-filter-sections"
        activeKey={activeTab}
        onSelect={setActiveTab}
        mountOnEnter
        unmountOnExit
        transition={false}
        className="mb-3"
        aria-label="Filter by"
      >
        <Tab eventKey="networks" title={title("Networks", ["Networks"])}>
          <NetworkSelector />
        </Tab>
        <Tab eventKey="variables" title={title("Variables", ["Variables"])}>
          <VariableSelector />
        </Tab>
        <Tab
          eventKey="observations"
          title={title("Observations", [
            "Observation frequency",
            "Only with climatology",
            "Include stations with no observations",
          ])}
        >
          <div className="mb-3">
            <FrequencySelector />
          </div>
          <div className="mb-3">
            <IncludeStationsWithNoObsControl />
          </div>
          <OnlyWithClimatologyControl />
        </Tab>
        <Tab
          eventKey="dates"
          title={title("Dates", ["Start date", "End date"])}
        >
          <Row className="g-3">
            <Col xs={6}>
              <DateSelector
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                maxDate={endDate}
              />
            </Col>
            <Col xs={6}>
              <DateSelector
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                minDate={startDate}
              />
            </Col>
          </Row>
          <p className="small text-muted mt-3">
            Dates filter stations by record coverage. Choose date clipping
            separately when downloading.
          </p>
        </Tab>
        <Tab eventKey="area" title={title("Area", ["Spatial area"])}>
          <p>
            {area
              ? "A drawn area limits matching stations and downloads. Stations outside it can still be inspected on the map."
              : "No area is drawn. Use the map drawing tools to limit matching stations and downloads."}
          </p>
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={!area}
            onClick={() => setArea(null)}
          >
            Clear drawn area
          </Button>
        </Tab>
        {children && (
          <Tab
            eventKey="attributes"
            title={
              <>
                Attributes
                {summary.attributeCount > 0 && (
                  <>
                    {" "}
                    <span className="text-success">
                      <span aria-hidden="true">•</span>
                      <span className="visually-hidden">
                        {summary.attributeCount}
                      </span>
                    </span>
                  </>
                )}
              </>
            }
          >
            {children}
          </Tab>
        )}
      </Tabs>
    </div>
  );
}

export default StationFilters;
