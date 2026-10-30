import React, { useState } from "react";
import { Row, Tab, Tabs } from "react-bootstrap";

import StationMap from "@/components/maps/StationMap";
import StationMetadata from "@/components/info/StationMetadata";
import DownloadStationData from "@/components/controls/DownloadStationData";
import SelectionCounts from "@/components/info/SelectionCounts";
import { useStationFilteringContext } from "@/state/context-hooks/use-station-filtering-context";
import NetworksMetadata from "@/components/info/NetworksMetadata";
import AdjustableColumns from "@/components/util/AdjustableColumns";

import { NoRenderContent } from "./NoRenderContent";
import { LazyRenderContent } from "./LazyRenderContent";

import useConfigContext from "@/state/context-hooks/use-config-context";

import css from "../common.module.css";

// Keep the legacy tab deployable while shared attributes are introduced:
// its request must use the same exact matching station IDs as the table.
function MatchingStationData() {
  const { selectedStations } = useStationFilteringContext();
  return (
    <div className="mt-3">
      <SelectionCounts />
      <p>
        Download station data matching the current station criteria, area and
        attributes.
      </p>
      <DownloadStationData
        stations={selectedStations}
        variant="outline-success"
      >
        Download matching station data (
        {selectedStations.length.toLocaleString()})
      </DownloadStationData>
    </div>
  );
}

export const BodyContent = () => {
  const config = useConfigContext();
  const [activeTab, setActiveTab] = useState(config.defaultTab);

  const rowClasses = "mt-3";

  return (
    <Row className={css.portal}>
      <AdjustableColumns
        defaultLgs={config.adjustableColumnWidthsDefault}
        contents={[
          // "map" ||  // Uncomment to suppress map
          <StationMap className={css.mainColumns} />,
          <Tabs
            id="non-map-controls"
            activeKey={activeTab}
            onSelect={setActiveTab}
            className={css.mainTabs}
          >
            <Tab
              eventKey={"Filters"}
              title={"Station Filters"}
              mountOnEnter
              unmountOnExit
            >
              <StationMetadata
                filterOnly
                onCloseFilters={() => setActiveTab("Metadata")}
              />
            </Tab>
            <Tab eventKey={"Metadata"} title={"Station Metadata"} mountOnEnter>
              <StationMetadata
                {...{ rowClasses }}
                onOpenFilters={() => setActiveTab("Filters")}
              />
            </Tab>
            <Tab eventKey={"Data"} title={"Station Data"} mountOnEnter>
              <MatchingStationData />
            </Tab>
            <Tab
              eventKey={"Networks"}
              title={"Networks"}
              mountOnEnter
              unmountOnExit
            >
              <NetworksMetadata />
            </Tab>
          </Tabs>,
        ]}
      />
    </Row>
  );
};
