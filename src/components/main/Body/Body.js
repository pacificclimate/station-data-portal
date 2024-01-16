import React, { useEffect, useMemo, useState } from "react";
import { useImmerByKey } from "../../../hooks";
import { Button, Card, Col, Row, Tab, Tabs } from "react-bootstrap";
import Select from "react-select";
import tap from "lodash/fp/tap";

import css from "../common.module.css";

import logger from "../../../logger";
import {
  getFrequencies,
  getNetworks,
  getStations,
  getVariables,
} from "../../../data-services/station-data-service";
import {
  dataDownloadFilename,
  dataDownloadUrl,
} from "../../../data-services/pdp-data-service";
import {
  stationAreaFilter,
  stationFilter,
} from "../../../utils/station-filtering";
import StationMap from "../../maps/StationMap";
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
import baseMaps from "../../maps/baseMaps";
import { useConfigContext } from "../ConfigContext";

logger.configure({ active: true });

// This hook wraps up all the metadata variables and fetching in one function,
// exporting only the metadata state (an immer immutable) and a couple
// of debug callbacks for controlling station fetches. This hook is used only
// by component Body; it's a way of clarifying and simplifying its code.
function useMetadata() {
  const config = useConfigContext();

  // Fetched metadata
  const [metadata, setMetadata] = useImmerByKey({
    networks: null,
    variables: null,
    frequencies: null,
    stations: null,
  });

  // Debugging support
  const [debug, setDebug] = useImmerByKey({
    stnsLimit: config.stationDebugFetchLimitsOptions[0],
    stationsReload: 0,
  });
  const setStnsLimit = setDebug.stnsLimit;
  const reloadStations = () => {
    console.log("### reloadStations");
    setDebug.stationsReload(debug.stationsReload + 1);
  };

  // Fetch data from backend

  useEffect(() => {
    getNetworks({ appConfig: config }).then((response) =>
      setMetadata.networks(response.data),
    );
  }, [config]);

  useEffect(() => {
    getVariables({ appConfig: config }).then((response) =>
      setMetadata.variables(response.data),
    );
  }, [config]);

  useEffect(() => {
    getFrequencies({ appConfig: config }).then((response) =>
      setMetadata.frequencies(response.data),
    );
  }, [config]);

  useEffect(() => {
    console.log("### loading stations");
    setMetadata.stations(null);
    getStations({
      appConfig: config,
      getParams: {
        compact: true,
        ...(config.stationDebugFetchOptions && {
          limit: debug.stnsLimit.value,
        }),
      },
    })
      .then(tap(() => console.log("### stations loaded")))
      .then((response) => setMetadata.stations(response.data));
  }, [debug]);

  return { metadata, setStnsLimit, reloadStations };
}

function Body() {
  const config = useConfigContext();

  // Metadata fetched from backend
  const { metadata, setStnsLimit, reloadStations } = useMetadata();

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
        metadata,
      }),
    [filterValuesTransitional, metadata],
  );

  const selectedStations = useMemo(
    () => stationAreaFilter(area, filteredStations),
    [area, filteredStations],
  );

  const rowClasses = { className: "mt-3" };

  return (
    <div className={css.portal}>
      <Row>
        <AdjustableColumns
          defaultLgs={config.adjustableColumnWidthsDefault}
          contents={[
            // "map" ||  // Uncomment to suppress map
            <StationMap
              {...baseMaps[config.baseMap]}
              stations={filteredStations}
              metadata={metadata}
              onSetArea={setArea}
              externalIsPending={
                metadata.stations === null || filteringIsPending
              }
            />,

            <Card style={{ marginLeft: "-15px", marginRight: "-10px" }}>
              <Card.Body>
                {config.showReloadStationsButton && (
                  <Button onClick={reloadStations}>Reload stations</Button>
                )}
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
                            options={config.stationDebugFetchLimitsOptions}
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
                          (See Station Metadata and Station Data tabs for
                          details)
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
                    <NetworksMetadata networks={metadata.networks} />
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>,
          ]}
        />
      </Row>
    </div>
  );
}

export default Body;
