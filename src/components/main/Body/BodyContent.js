import React, { useState } from "react";
import { Row, Tab, Tabs } from "react-bootstrap";

import StationFilters from "@/components/controls/StationFilters";
import StationMap from "@/components/maps/StationMap";
import StationMetadata from "@/components/info/StationMetadata";
import StationData from "@/components/info/StationData";
import NetworksMetadata from "@/components/info/NetworksMetadata";
import AdjustableColumns from "@/components/util/AdjustableColumns";

import { NoRenderContent } from "./NoRenderContent";
import { LazyRenderContent } from "./LazyRenderContent";

import useConfigContext from "@/state/context-hooks/use-config-context";

import css from "../common.module.css";

export const BodyContent = () => {
  const config = useConfigContext();

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
};
