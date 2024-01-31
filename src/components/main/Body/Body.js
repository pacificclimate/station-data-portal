"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Col, Row, Tab, Tabs } from "react-bootstrap";
import Select from "react-select";

import css from "../common.module.css";

import logger from "../../../logger";
import {
  dataDownloadFilename,
  dataDownloadUrl,
} from "../../../data/pdp-data-service";
import {
  stationAreaFilter,
  stationFilter,
} from "../../../utils/station-filtering";
import StationMetadata from "../../info/StationMetadata";
import StationData from "../../info/StationData";
import NetworksMetadata from "../../info/NetworksMetadata";
import SelectionCounts from "../../info/SelectionCounts";
import SelectionCriteria from "../../info/SelectionCriteria";
import UnselectedThings from "../../info/UnselectedThings";
import AdjustableColumns from "../../util/AdjustableColumns";
import StationFilters, {
  useStationFiltering,
} from "../../controls/StationFilters";

logger.configure({ active: true });

import dynamic from "next/dynamic";

const StationMap = dynamic(async () => await import("../../maps/StationMap"), {
  ssr: false,
});

function Body({ metaData }) {
  const config = metaData.config;
  const actions = {
    reloadStations: () => {},
    setStationsLimit: () => {},
  };

  // Station filtering state and setters
  const {
    normal: filterValuesNormal,
    transitional: filterValuesTransitional,
    isPending: filteringIsPending,
    setState: filterValuesSetState,
  } = useStationFiltering();

  // Map polygon, used for selecting (not filtering) stations.
  const [area, setArea] = useState(undefined);

  // The key to a responsive UI is here: station filtering and all updates
  // based on it are done in a transition. The filter values state reflecting
  // this is `filterValuesTransitional`, used here.
  const filteredStations = useMemo(
    () =>
      stationFilter({
        filterValues: filterValuesTransitional,
        metadata: metaData,
      }),
    [filterValuesTransitional, metaData],
  );

  const selectedStations = useMemo(
    () => stationAreaFilter(area, filteredStations),
    [area, filteredStations],
  );

  const rowClasses = { className: "mt-3" };

  return (
    <Row className={css.portal}>
      <AdjustableColumns
        defaultLgs={config.adjustableColumnWidthsDefault}
        contents={[
          // "map" ||  // Uncomment to suppress map
          <StationMap
            config={config}
            stations={filteredStations}
            metadata={metaData}
            onSetArea={setArea}
            externalIsPending={metaData.stations === null || filteringIsPending}
            onReloadStations={actions.reloadStations}
            className={css.mainColumns}
          />,
          <Tabs
            id="non-map-controls"
            defaultActiveKey={config.defaultTab}
            className={css.mainTabs}
          >
            <Tab eventKey={"Filters"} title={"Station Filters"}>
              {config.stationDebugFetchOptions && (
                <Row>
                  <Col lg={6}>Fetch limit</Col>
                  <Col lg={6}>
                    <Select
                      options={config.stationDebugFetchOptions.map((n) => ({
                        value: n,
                        label: n.toString(),
                      }))}
                      value={stnsLimit}
                      onChange={setStnsLimit}
                    />
                  </Col>
                </Row>
              )}
              <Row {...rowClasses}>
                <Col lg={12} md={12} sm={12}>
                  <SelectionCounts
                    allStations={metaData.stations}
                    selectedStations={selectedStations}
                  />
                  <p className={"mb-0"}>
                    (See Station Metadata and Station Data tabs for details)
                  </p>
                </Col>
              </Row>
              <StationFilters
                state={filterValuesNormal}
                setState={filterValuesSetState}
                metadata={metaData}
                rowClasses={rowClasses}
              />
            </Tab>

            <Tab eventKey={"Metadata"} title={"Station Metadata"}>
              <Row {...rowClasses}>
                <SelectionCounts
                  allStations={metaData.stations}
                  selectedStations={selectedStations}
                />
              </Row>
              <StationMetadata
                stations={selectedStations}
                metadata={metaData}
              />
            </Tab>

            <Tab eventKey={"Data"} title={"Station Data"}>
              <Row {...rowClasses}>
                <SelectionCounts
                  allStations={metaData.stations}
                  selectedStations={selectedStations}
                />
                <SelectionCriteria />
              </Row>
              <UnselectedThings
                selectedNetworksOptions={
                  filterValuesNormal.selectedNetworksOptions
                }
                selectedVariablesOptions={
                  filterValuesNormal.selectedVariablesOptions
                }
                selectedFrequenciesOptions={
                  filterValuesNormal.selectedFrequenciesOptions
                }
              />

              <StationData
                config={config}
                filterValues={filterValuesNormal}
                selectedStations={selectedStations}
                dataDownloadUrl={dataDownloadUrl({
                  config,
                  filterValues: filterValuesNormal,
                  polygon: area,
                })}
                dataDownloadFilename={dataDownloadFilename}
                rowClasses={rowClasses}
              />
            </Tab>

            <Tab eventKey={"Networks"} title={"Networks"}>
              <NetworksMetadata config={config} networks={metaData.networks} />
            </Tab>
          </Tabs>,
        ]}
      />
    </Row>
  );
}

export default Body;
