import React, { useState } from "react";
import { Row, Tab, Tabs } from "react-bootstrap";

import logger from "@/logger";
import StationFilters from "@/components/controls/StationFilters";
import StationMap from "@/components/maps/StationMap";
import StationMetadata from "@/components/info/StationMetadata";
import StationData from "@/components/info/StationData";
import NetworksMetadata from "@/components/info/NetworksMetadata";
import AdjustableColumns from "@/components/util/AdjustableColumns";
import useConfigContext from "@/state/context-hooks/use-config-context";
import { NoRenderContent } from "./NoRenderContent";
import { LazyRenderContent } from "./LazyRenderContent";
import { useStationsStore } from "@/state/client/stations-store";
import { useStationFilteringDefaults } from "@/state/client-server-hooks/use-station-filtering-defaults";

import css from "../common.module.css";

logger.configure({ active: true });

function Body() {
  const config = useConfigContext();
  useStationFilteringDefaults();

  const { area } = useStationsStore((state) => ({
    area: state.area,
  }));

  const rowClasses = "mt-3";

  const [key, setKey] = useState(config.defaultTab);

  return (
    <Row className={css.portal}>
      <AdjustableColumns
        defaultLgs={config.adjustableColumnWidthsDefault}
        contents={[
          // "map" ||  // Uncomment to suppress map
          <StationMap className={css.mainColumns} />,
          <Tabs
            id="non-map-controls"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className={css.mainTabs}
          >
            <Tab eventKey={"Filters"} title={"Station Filters"}>
              <NoRenderContent visible={key === "Filters"}>
                <StationFilters {...{ rowClasses }} />
              </NoRenderContent>
            </Tab>
            <Tab eventKey={"Metadata"} title={"Station Metadata"}>
              <LazyRenderContent visible={key === "Metadata"}>
                <StationMetadata {...{ rowClasses }} />
              </LazyRenderContent>
            </Tab>
            <Tab eventKey={"Data"} title={"Station Data"}>
              <LazyRenderContent visible={key === "Data"}>
                <StationData {...{ rowClasses }} />
              </LazyRenderContent>
            </Tab>
            <Tab eventKey={"Networks"} title={"Networks"}>
              <NoRenderContent visible={key === "Networks"}>
                <NetworksMetadata />
              </NoRenderContent>
            </Tab>
          </Tabs>,
        ]}
      />
    </Row>
  );
}

export const Component = Body;
export default Body;
