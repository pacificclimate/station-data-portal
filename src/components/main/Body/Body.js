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
import { dataDownloadTarget, dataDownloadFilename }
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
import {
  markerClusteringAvailable,
  showReloadStationsButton,
  stationDebugFetchOptions,
} from '../../../utils/configuration';


logger.configure({ active: true });

const defaultLgs = [7, 5];

// TODO: Place elsewhere
const stnsLimitOptions =
  [100, 500, 1000, 2000, 4000, 8000].map(value => ({
    value, label: value.toString()
  }));


function Body() {
  // Metadata fetched from backend
  const [allNetworks, setAllNetworks] = useState(null);
  const [allVariables, setAllVariables] = useState(null);
  const [allFrequencies, setAllFrequencies] = useState(null);
  const [allStations, setAllStations] = useState(null);

  // Support for development tools
  const [stnsLimit, setStnsLimit] = useState(stnsLimitOptions[0]);
  const [stationsReload, setStationsReload] = useState(0);

  // Station filtering state and setters
  const stationFiltering = useStationFiltering();
  const {
    startDate,
    endDate,
    selectedNetworksOptions,
    selectedVariablesOptions,
    selectedFrequenciesOptions,
    onlyWithClimatology,
    networkActions,
    variableActions,
    frequencyActions,
    isPending,
  } = stationFiltering;

  const [area, setArea] = useState(undefined);

  // Marker clustering option controls.
  const [uzeMarkercluster, toggleUzeMarkercluster] =
    useBooleanStateWithToggler(markerClusteringAvailable);
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
      ...(stationDebugFetchOptions && { limit: stnsLimit.value } )
    })
      .then(tap(() => console.log("### stations loaded")))
      .then(response => setAllStations(response.data));
  }, [stnsLimit, stationsReload]);

  const reloadStations = () => {
    console.log("### reloadStations")
    setStationsReload(n => n + 1)
  };

  const dataDownloadUrl = ({ dataCategory, clipToDate, fileFormat }) => {
    // Check whether state has settled. Each selector calls an onReady callback
    // to export information (e.g., all its options) that it has set up
    // internally. In retrospect, this is a too-clever solution to the problem
    // of passing a pile of props around, but it's what we've got.
    if (!networkActions || !variableActions || !frequencyActions) {
      return "#";
    }

    return dataDownloadTarget({
      startDate,
      endDate,
      selectedNetworksOptions,
      selectedVariablesOptions,
      selectedFrequenciesOptions,
      polygon: area,
      onlyWithClimatology,
      allNetworksOptions: networkActions.getAllOptions(),
      allVariablesOptions: variableActions.getAllOptions(),
      allFrequenciesOptions: frequencyActions.getAllOptions(),
      dataCategory,
      clipToDate,
      dataFormat: fileFormat,
    });
  };

  const filteredStations = useMemo(
    () => stationFilter(
      startDate,
      endDate,
      selectedNetworksOptions,
      selectedVariablesOptions,
      selectedFrequenciesOptions,
      onlyWithClimatology,
      allNetworks,
      allVariables,
      allStations,
    ),
    [
      startDate,
      endDate,
      selectedNetworksOptions,
      selectedVariablesOptions,
      selectedFrequenciesOptions,
      onlyWithClimatology,
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
          defaultLgs={defaultLgs}
          contents={[
            // "map" ||  // Uncomment to suppress map
            <StationMap
              {...baseMaps[process.env.REACT_APP_BASE_MAP]}
              stations={filteredStations}
              allNetworks={allNetworks}
              allVariables={allVariables}
              onSetArea={setArea}
              markerClusterOptions={uzeMarkercluster && markerClusterOptions}
              isPending={isPending}
            />,

            <Card style={{ marginLeft: '-15px', marginRight: '-10px' }}>
              <Card.Body>
                { showReloadStationsButton && (
                  <Button onClick={reloadStations}>
                    Reload stations
                  </Button>
                )}
                <Tabs
                  id="non-map-controls"
                  defaultActiveKey={'Metadata'}
                  className={css.mainTabs}
                >
                  { markerClusteringAvailable && (
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
                    {stationDebugFetchOptions && (
                      <Row>
                        <Col lg={6}>Fetch limit</Col>
                        <Col lg={6}>
                          <Select
                            options={stnsLimitOptions}
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
                      allNetworks={allNetworks}
                      allVariables={allVariables}
                      allFrequencies={allFrequencies}
                      {...stationFiltering}
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
                      selectedNetworksOptions={selectedNetworksOptions}
                      selectedVariablesOptions={selectedVariablesOptions}
                      selectedFrequenciesOptions={selectedFrequenciesOptions}
                    />

                    <StationData
                      selectedStations={selectedStations}
                      dataDownloadUrl={dataDownloadUrl}
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
