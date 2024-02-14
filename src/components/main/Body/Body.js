import React, { useEffect, useMemo, useState } from "react";
import { Col, Row, Tab, Tabs } from "react-bootstrap";
import Select from "react-select";

import logger from "../../../logger";
import {
  dataDownloadFilename,
  dataDownloadUrl,
} from "../../../api/pdp-data-service";
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
import { useStore } from "../../../state/state-store";
import { useShallow } from "zustand/react/shallow";
import { useConfig } from "../../../state/query-hooks/use-config";
import { useStations } from "../../../state/query-hooks/use-stations";
import { useVariables } from "../../../state/query-hooks/use-variables";
import { useFrequencies } from "../../../state/query-hooks/use-frequencies";
import { useNetworks } from "../../../state/query-hooks/use-networks";

import css from "../common.module.css";

logger.configure({ active: true });

function Body() {
  const { data: config } = useConfig();
  const {
    data: stations,
    isLoading: isStationsLoading,
    isError: isStationsError,
  } = useStations();
  const {
    data: variables,
    isLoading: isVariablesLoading,
    isError: isVariablesError,
  } = useVariables();
  const {
    data: frequencies,
    isLoading: isFrequenciesLoading,
    isError: isFrequenciesError,
  } = useFrequencies();
  const {
    data: networks,
    isLoading: networksLoading,
    isError: networksError,
  } = useNetworks();

  const actions = useStore(
    useShallow((state) => ({
      setStationsLimit: state.setStationsLimit,
      reloadStations: state.reloadStations,
    })),
  );

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
        metadata: { stations, variables },
      }),
    [filterValuesTransitional, stations, variables],
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
            {...baseMaps[config.baseMap]}
            stations={filteredStations}
            onSetArea={setArea}
            externalIsPending={isStationsLoading || filteringIsPending}
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
                      options={config.stationDebugFetchLimitsOptions}
                      value={stnsLimit}
                      onChange={actions.setStnsLimit}
                    />
                  </Col>
                </Row>
              )}
              <Row {...rowClasses}>
                <Col lg={12} md={12} sm={12}>
                  <SelectionCounts
                    allStations={stations}
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
                rowClasses={rowClasses}
              />
            </Tab>

            <Tab eventKey={"Metadata"} title={"Station Metadata"}>
              <Row {...rowClasses}>
                <SelectionCounts
                  allStations={stations}
                  selectedStations={selectedStations}
                />
              </Row>
              <StationMetadata stations={selectedStations} />
            </Tab>

            <Tab eventKey={"Data"} title={"Station Data"}>
              <Row {...rowClasses}>
                <SelectionCounts
                  allStations={stations}
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
              <NetworksMetadata networks={networks} />
            </Tab>
          </Tabs>,
        ]}
      />
    </Row>
  );
}

export const Component = Body;
export default Body;
