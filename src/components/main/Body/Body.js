import React, { useEffect, useMemo, useState } from 'react';
import { useBooleanStateWithToggler } from '../../../hooks';
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Tab,
  Tabs
} from 'react-bootstrap';
import Select from 'react-select';
import tap from 'lodash/fp/tap';

import css from '../common.module.css';

import logger from '../../../logger';
import {
  getFrequencies,
  getNetworks,
  getStations,
  getVariables,
} from '../../../data-services/station-data-service';
import { dataDownloadFilename, dataDownloadUrl }
  from '../../../data-services/pdp-data-service';
import {
  stationAreaFilter,
  stationFilter,
} from '../../../utils/station-filtering';
import MarkerClusterOptions, { useMarkerClusterOptions}
  from '../../controls/MarkerClusterOptions'
import StationMap from '../../maps/StationMap';
import StationMetadata from '../../info/StationMetadata';
import StationData from '../../info/StationData';
import NetworksMetadata from '../../info/NetworksMetadata';
import SelectionCounts from '../../info/SelectionCounts';
import SelectionCriteria from '../../info/SelectionCriteria';
import UnselectedThings from '../../info/UnselectedThings';
import AdjustableColumns from '../../util/AdjustableColumns';
import StationFilters, { useStationFiltering }
  from '../../controls/StationFilters';
import JSONstringify from '../../util/JSONstringify';
import baseMaps from '../../maps/baseMaps';
import { config } from '../../../utils/configuration';


logger.configure({ active: true });

function Body() {
  // Metadata fetched from backend
  const [allNetworks, setAllNetworks] = useState(null);
  const [allVariables, setAllVariables] = useState(null);
  const [allFrequencies, setAllFrequencies] = useState(null);
  const [allStations, setAllStations] = useState(null);

  // Support for development tools
  const [stnsLimit, setStnsLimit] = useState(
    config.stationDebugFetchLimitsOptions[0]
  );
  const [stationsReload, setStationsReload] = useState(0);

  // Station filtering state and setters
  const {
    normal: filterValuesNormal,
    transitional: filterValuesTransitional,
    isPending: filteringIsPending,
    setState: filterValuesSetState,
  } = useStationFiltering();

  // Map polygon, used for selecting (not filtering) stations.
  const [area, setArea] = useState(undefined);

  // Marker clustering option controls.
  const [uzeMarkercluster, toggleUzeMarkercluster] =
    useBooleanStateWithToggler(config.markerClusteringAvailable);
  const [markerClusterOptions, setMarkerClusterOptions] =
    useMarkerClusterOptions({
      removeOutsideVisibleBounds: true,
      spiderfyOnMaxZoom: false,
      zoomToBoundsOnClick: false,
      disableClusteringAtZoom: 8,
      maxClusterRadius: 80,
      chunkedLoading: true,
    });

  // Load metadata

  useEffect(() => {
    getNetworks().then(response => setAllNetworks(response.data));
  }, []);

  useEffect(() => {
    getVariables().then(response => setAllVariables(response.data));
  }, []);

  useEffect(() => {
    getFrequencies().then(response => setAllFrequencies(response.data));
  }, []);

  useEffect(() => {
    console.log("### loading stations")
    setAllStations(null)
    getStations({
      compact: true,
      ...(config.stationDebugFetchOptions && { limit: stnsLimit.value } )
    })
      .then(tap(() => console.log("### stations loaded")))
      .then(response => setAllStations(response.data));
  }, [stnsLimit, stationsReload]);

  const reloadStations = () => {
    console.log("### reloadStations")
    setStationsReload(n => n + 1)
  };

  // The key to a responsive UI is here: station filtering and all updates
  // based on it are done in a transition. The filter values state reflecting
  // this is `filterValuesTransitional`, used here.
  const filteredStations = useMemo(
    () => stationFilter({
      ...filterValuesTransitional,
      allNetworks,
      allVariables,
      allStations,
    }),
    [
      filterValuesTransitional,
      allNetworks,
      allVariables,
      allStations,
    ]
  );

  const selectedStations = useMemo(
    () => stationAreaFilter(area, filteredStations),
    [area, filteredStations]
  );

  const rowClasses = { className: "mt-3" }

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
              allNetworks={allNetworks}
              allVariables={allVariables}
              onSetArea={setArea}
              markerClusterOptions={uzeMarkercluster && markerClusterOptions}
              externalIsPending={
                (allStations === null) || filteringIsPending
              }
            />,

            <Card style={{ marginLeft: '-15px', marginRight: '-10px' }}>
              <Card.Body>
                { config.showReloadStationsButton && (
                  <Button onClick={reloadStations}>
                    Reload stations
                  </Button>
                )}
                <Tabs
                  id="non-map-controls"
                  defaultActiveKey={config.defaultTab}
                  className={css.mainTabs}
                >
                  { config.markerClusteringAvailable && (
                    <Tab
                      eventKey={'Clustering'}
                      title={`Marker Clustering (${uzeMarkercluster ? "on": "off"})`}
                    >
                      <SelectionCounts
                        allStations={allStations}
                        selectedStations={selectedStations}
                      />
                      <Form>
                        <Form.Check
                          inline
                          label={"Use leaflet.markercluster"}
                          checked={uzeMarkercluster}
                          onChange={toggleUzeMarkercluster}
                        />
                      </Form>
                      <MarkerClusterOptions
                        value={markerClusterOptions}
                        onChange={setMarkerClusterOptions}
                      />
                      <JSONstringify object={markerClusterOptions}/>
                    </Tab>
                  )}

                  <Tab eventKey={'Filters'} title={'Station Filters'}>
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
                          allStations={allStations}
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
                      allNetworks={allNetworks}
                      allVariables={allVariables}
                      allFrequencies={allFrequencies}
                      rowClasses={rowClasses}
                    />
                  </Tab>

                  <Tab eventKey={'Metadata'} title={'Station Metadata'}>
                    <Row {...rowClasses}>
                      <SelectionCounts
                        allStations={allStations}
                        selectedStations={selectedStations}
                      />
                    </Row>
                    <StationMetadata
                      stations={selectedStations}
                      allNetworks={allNetworks}
                      allVariables={allVariables}
                    />
                  </Tab>

                  <Tab eventKey={'Data'} title={'Station Data'}>
                    <Row {...rowClasses}>
                      <SelectionCounts
                        allStations={allStations}
                        selectedStations={selectedStations}
                      />
                      <SelectionCriteria/>
                    </Row>
                    <UnselectedThings
                      selectedNetworksOptions={filterValuesNormal.selectedNetworksOptions}
                      selectedVariablesOptions={filterValuesNormal.selectedVariablesOptions}
                      selectedFrequenciesOptions={filterValuesNormal.selectedFrequenciesOptions}
                    />

                    <StationData
                      selectedStations={selectedStations}
                      dataDownloadUrl={
                        dataDownloadUrl({
                          filterValues: filterValuesNormal,
                          polygon: area
                        })
                      }
                      dataDownloadFilename={dataDownloadFilename}
                      rowClasses={rowClasses}
                    />
                  </Tab>

                  <Tab eventKey={'Networks'} title={'Networks'}>
                    <NetworksMetadata networks={allNetworks}/>
                  </Tab>

                </Tabs>
              </Card.Body>
            </Card>
          ]}
        />
      </Row>
    </div>
  );
}

export default Body;
