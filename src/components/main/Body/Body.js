import React, { useMemo, useState } from "react";
import { Col, Row, Tab, Tabs } from "react-bootstrap";
import Select from "react-select";

import logger from "@/logger";
import { dataDownloadFilename, dataDownloadUrl } from "@/api/pdp-data-service";
import { stationAreaFilter, stationFilter } from "@/utils/station-filtering";
import StationMap from "@/components/maps/StationMap";
import StationMetadata from "@/components/info/StationMetadata";
import StationData from "@/components/info/StationData";
import NetworksMetadata from "@/components/info/NetworksMetadata";
import SelectionCounts from "@/components/info/SelectionCounts";
import SelectionCriteria from "@/components/info/SelectionCriteria";
import UnselectedThings from "@/components/info/UnselectedThings";
import AdjustableColumns from "@/components/util/AdjustableColumns";
import StationFilters, {
  useStationFiltering,
} from "@/components/controls/StationFilters";
import baseMaps from "@/components/maps/baseMaps";
import { useStore } from "@/state/client/state-store";
import { useShallow } from "zustand/react/shallow";
import { stationsQuery, useStations } from "@/state/query-hooks/use-stations";
import {
  variablesQuery,
  useVariables,
} from "@/state/query-hooks/use-variables";
import { networksQuery } from "@/state/query-hooks/use-networks";
import { frequenciesQuery } from "@/state/query-hooks/use-frequencies";
import { historiesQuery } from "@/state/query-hooks/use-histories";
import { configQuery } from "@/state/query-hooks/use-config";
import useConfigContext from "@/state/context-hooks/use-config-context";
import { NoRenderContent } from "./NoRenderContent";

import css from "../common.module.css";

logger.configure({ active: true });

export const bodyLoader = (queryClient) => async () => {
  const config = await queryClient.ensureQueryData(configQuery());
  const stationsLimit =
    useStore.getState().stationsLimit ?? config.stationsLimit;
  queryClient.ensureQueryData(stationsQuery(config, stationsLimit));
  queryClient.ensureQueryData(variablesQuery(config));
  queryClient.ensureQueryData(networksQuery(config));
  queryClient.ensureQueryData(frequenciesQuery(config));
  queryClient.ensureQueryData(historiesQuery(config));
  return null;
};

function Body() {
  const config = useConfigContext();
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

  const [key, setKey] = useState(config.defaultTab);

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
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className={css.mainTabs}
          >
            <Tab eventKey={"Filters"} title={"Station Filters"}>
              <NoRenderContent visible={key === "Filters"}>
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
              </NoRenderContent>
            </Tab>

            <Tab eventKey={"Metadata"} title={"Station Metadata"}>
              <NoRenderContent visible={key === "Metadata"}>
                <Row {...rowClasses}>
                  <SelectionCounts
                    allStations={stations}
                    selectedStations={selectedStations}
                  />
                </Row>
                <StationMetadata stations={selectedStations} />
              </NoRenderContent>
            </Tab>

            <Tab eventKey={"Data"} title={"Station Data"}>
              <NoRenderContent visible={key === "Data"}>
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
              </NoRenderContent>
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
