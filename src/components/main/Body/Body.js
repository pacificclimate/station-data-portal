"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useImmerByKey } from "../../../hooks";
import { Button, Card, Col, Row, Tab, Tabs } from "react-bootstrap";
import Select from "react-select";

import css from "../common.module.css";

import logger from "../../../logger";
import {
  dataDownloadFilename,
  dataDownloadUrl,
} from "../../../api/pdp-data-service";
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
import { useStore } from "../../../state/state-store";
import { useShallow } from "zustand/react/shallow";

logger.configure({ active: true });

import dynamic from "next/dynamic";

const StationMap = dynamic(async () => await import("../../maps/StationMap"), {
  ssr: false,
});

function Body({ config }) {
  // metadata are the data items that can be watched for changes and
  // should probably cause a re-render.
  const metadata = useStore(
    useShallow((state) => ({
      networks: state.networks,
      stations: state.stations,
      variables: state.variables,
      frequencies: state.frequencies,
      stationsLimit: state.stationsLimit,
    })),
  );

  // actions should be fixed functions on the store, so they shouldn't really change
  const actions = useStore(
    useShallow((state) => ({
      setStationsLimit: state.setStationsLimit,
      reloadStations: state.reloadStations,
      loadMetadata: state.loadMetadata,
    })),
  );

  // Station filtering state and setters
  const {
    normal: filterValuesNormal,
    transitional: filterValuesTransitional,
    isPending: filteringIsPending,
    setState: filterValuesSetState,
  } = useStationFiltering();

  // load data once on initial render after config is loaded
  useEffect(() => {
    actions.loadMetadata({ config });
  }, []);

  // Map polygon, used for selecting (not filtering) stations.
  const [area, setArea] = useState(undefined);

  // The key to a responsive UI is here: station filtering and all updates
  // based on it are done in a transition. The filter values state reflecting
  // this is `filterValuesTransitional`, used here.
  const filteredStations = useMemo(
    () =>
      stationFilter({
        filterValues: filterValuesTransitional,
        metadata,
      }),
    [filterValuesTransitional, metadata],
  );

  const selectedStations = useMemo(
    () => stationAreaFilter(area, filteredStations),
    [area, filteredStations],
  );

  if (!metadata.stations) {
    return <div>Loading...</div>;
  }

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
            metadata={metadata}
            onSetArea={setArea}
            externalIsPending={metadata.stations === null || filteringIsPending}
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
                    allStations={metadata.stations}
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
                metadata={metadata}
                rowClasses={rowClasses}
              />
            </Tab>

            <Tab eventKey={"Metadata"} title={"Station Metadata"}>
              <Row {...rowClasses}>
                <SelectionCounts
                  allStations={metadata.stations}
                  selectedStations={selectedStations}
                />
              </Row>
              <StationMetadata
                stations={selectedStations}
                metadata={metadata}
              />
            </Tab>

            <Tab eventKey={"Data"} title={"Station Data"}>
              <Row {...rowClasses}>
                <SelectionCounts
                  allStations={metadata.stations}
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
              <NetworksMetadata config={config} networks={metadata.networks} />
            </Tab>
          </Tabs>,
        ]}
      />
    </Row>
  );
}

export default Body;
