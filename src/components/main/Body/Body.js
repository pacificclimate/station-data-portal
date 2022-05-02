import React, { useEffect, useMemo, useState } from 'react';
import { useStateWithEventHandler, useBooleanStateWithToggler }
  from '../../../hooks';
import {
  Checkbox,
  Col,
  ControlLabel,
  FormControl,
  FormGroup,
  Panel,
  Row,
  Tab,
  Tabs
} from 'react-bootstrap';
import Select from 'react-select';
import memoize from 'memoize-one';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import join from 'lodash/fp/join';

import css from '../common.module.css';

import logger from '../../../logger';
import NetworkSelector from '../../selectors/NetworkSelector';
import {
  getFrequencies,
  getNetworks,
  getStations,
  getVariables,
} from '../../../data-services/station-data-service';
import { dataDownloadTarget } from '../../../data-services/pdp-data-service';
import VariableSelector from '../../selectors/VariableSelector';
import FrequencySelector
  from '../../selectors/FrequencySelector/FrequencySelector';
import DateSelector from '../../selectors/DateSelector';
import {
  stationFilter as stationFilterRaw,
  stationInsideMultiPolygon
} from '../../../utils/station-filtering';
import OnlyWithClimatologyControl
  from '../../controls/OnlyWithClimatologyControl';
import StationMap from '../../maps/StationMap';
import StationMetadata from '../../info/StationMetadata';
import StationData from '../../info/StationData';
import NetworksMetadata from '../../info/NetworksMetadata';
import SelectionCounts from '../../info/SelectionCounts';
import SelectionCriteria from '../../info/SelectionCriteria';
import AdjustableColumns from '../../util/AdjustableColumns';
import JSONstringify from '../../util/JSONstringify';
import baseMaps from '../../maps/baseMaps';


logger.configure({ active: true });


const commonSelectorStyles = {
  menu: (provided) => {
    return {
      ...provided,
      zIndex: 999,
    }
  },
  valueContainer: (provided, state) => ({
    ...provided,
    maxHeight: '10em',
    overflowY: 'auto',
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    width: '2em',
  }),
  option: (styles) => {
    return {
      ...styles,
      padding: '0.5em',
      fontSize: '0.9em',
    }
  }
};


const defaultLgs = [7, 5];

const stnsLimitOptions =
  [100, 500, 1000, 2000, 4000, 8000].map(value => ({
    value, label: value.toString()
  }));


const stationDebugFetchOptions =
  (process.env.REACT_APP_DEBUG_STATION_FETCH_OPTIONS || "").toLowerCase()
  === "true";


function Body() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [allNetworks, setAllNetworks] = useState(null);
  const [selectedNetworksOptions, setSelectedNetworksOptions] = useState([]);
  const [networkActions, setNetworkActions] = useState(null);

  const [allVariables, setAllVariables] = useState(null);
  const [selectedVariablesOptions, setSelectedVariablesOptions] = useState([]);
  const [variableActions, setVariableActions] = useState(null);

  const [allFrequencies, setAllFrequencies] = useState(null);
  const [selectedFrequenciesOptions, setSelectedFrequenciesOptions] = useState([]);
  const [frequencyActions, setFrequencyActions] = useState(null);

  const [onlyWithClimatology, setOnlyWithClimatology] = useState(false);

  const [allStations, setAllStations] = useState(null);

  const [area, setArea] = useState(undefined);
  const [stnsLimit, setStnsLimit] = useState(stnsLimitOptions[0]);

  // Marker clustering option controls. We offer a subset of the options.

  const useStateWithEventHandler = init => {
    const [state, setState] = useState(init);
    return [state, e => setState(e.target.value)]
  };

  const useBooleanStateWithToggler = init => {
    const [state, setState] = useState(init);
    return [state, () => setState(!state)];
  };

  const [uzeMarkercluster, toggleUzeMarkercluster] =
    useBooleanStateWithToggler(true);
  const [removeOutsideVisibleBounds, toggleRemoveOutsideVisibleBounds] =
    useBooleanStateWithToggler(true);
  const [spiderfyOnMaxZoom, toggleSpiderfyOnMaxZoom] =
    useBooleanStateWithToggler(false);
  const [zoomToBoundsOnClick, toggleZoomToBoundsOnClick] =
    useBooleanStateWithToggler(false);
  const [enableClustering, toggleEnableClustering] =
    useBooleanStateWithToggler(true);
  const [disableClusteringAtZoom, handleChangeDisableClusteringAtZoom] =
    useStateWithEventHandler(8);
  const [maxClusterRadius, handleChangeMaxClusterRadius] =
    useStateWithEventHandler(80);
  const [chunkedLoading, toggleChunkedLoading] =
    useBooleanStateWithToggler(true);

  const markerClusterOptions = React.useMemo(
    () => uzeMarkercluster && ({
      removeOutsideVisibleBounds,
      spiderfyOnMaxZoom,
      zoomToBoundsOnClick,
      "disableClusteringAtZoom":
        enableClustering ? disableClusteringAtZoom : undefined,
      maxClusterRadius,
      chunkedLoading,
    }),
    [
      removeOutsideVisibleBounds,
      uzeMarkercluster,
      spiderfyOnMaxZoom,
      zoomToBoundsOnClick,
      enableClustering,
      disableClusteringAtZoom,
      maxClusterRadius,
      chunkedLoading,
    ]
  );

  // TODO: Remove? Not presently used, but there is commented out code
  //  in Filters tab that uses them.
  // const handleClickAll = () => {
  //   networkActions.selectAll();
  //   variableActions.selectAll();
  //   frequencyActions.selectAll();
  // };
  // const handleClickNone = () => {
  //   networkActions.selectNone();
  //   variableActions.selectNone();
  //   frequencyActions.selectNone();
  // };

  const toggleOnlyWithClimatology = () =>
    setOnlyWithClimatology(!onlyWithClimatology);

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
    getStations({
      compact: true,
      ...(stationDebugFetchOptions && { limit: stnsLimit.value } )
    })
      .then(response => setAllStations(response.data));
  }, [stnsLimit]);

  const stationFilter = memoize(stationFilterRaw);

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

  // TODO: Check download URLs

  const dataDownloadFilename = ({ dataCategory, fileFormat }) => {
    return `${{ dataCategory, fileFormat }}.${get('value', fileFormat)}`;
  }

  const filteredStations = useMemo(
    () => stationFilter(
      startDate,
      endDate,
      selectedNetworksOptions,
      selectedVariablesOptions,
      selectedFrequenciesOptions,
      onlyWithClimatology,
      area,
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
      area,
      allNetworks,
      allVariables,
      allStations,
    ]
  );

  const selectedStations = useMemo(
    () => filter(stationInsideMultiPolygon(area), filteredStations),
    [area, filteredStations]
  );

  const selections = [
    {
      name: 'networks',
      items: selectedNetworksOptions,
    },
    {
      name: 'variables',
      items: selectedVariablesOptions,
    },
    {
      name: 'frequencies',
      items: selectedFrequenciesOptions,
    },
  ];

  const unselectedThings = flow(
    filter(thing => thing.items.length === 0),
    map(thing => thing.name),
    join(', or '),
  )(selections);

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
              markerClusterOptions={markerClusterOptions}
            />,

            <Panel style={{ marginLeft: '-15px', marginRight: '-10px' }}>
              <Panel.Body>
                <Tabs
                  id="non-map-controls"
                  defaultActiveKey={'Clustering'}
                  className={css.mainTabs}
                >
                  <Tab
                    eventKey={'Clustering'}
                    title={`Marker Clustering (${uzeMarkercluster ? "on": "off"})`}
                  >
                    <SelectionCounts
                      allStations={allStations}
                      selectedStations={selectedStations}
                    />
                    <FormGroup>
                      <Checkbox
                        inline
                        checked={uzeMarkercluster}
                        onChange={toggleUzeMarkercluster}
                      >
                        Use leaflet.markercluster
                      </Checkbox>

                      <Checkbox
                        checked={removeOutsideVisibleBounds}
                        onChange={toggleRemoveOutsideVisibleBounds}
                      >
                        removeOutsideVisibleBounds
                      </Checkbox>

                      <Checkbox
                        checked={spiderfyOnMaxZoom}
                        onChange={toggleSpiderfyOnMaxZoom}
                      >
                        spiderfyOnMaxZoom
                      </Checkbox>

                      <Checkbox
                        checked={zoomToBoundsOnClick}
                        onChange={toggleZoomToBoundsOnClick}
                      >
                        zoomToBoundsOnClick
                      </Checkbox>

                      <Checkbox
                        inline
                        checked={enableClustering}
                        onChange={toggleEnableClustering}
                      >
                        Enable clustering
                      </Checkbox>
                      <FormControl
                        componentClass={"input"}
                        placeholder={"Zoom level"}
                        type={"number"}
                        disabled={!enableClustering}
                        value={disableClusteringAtZoom}
                        onChange={handleChangeDisableClusteringAtZoom}
                      />

                      <ControlLabel>Max. cluster radius</ControlLabel>
                      <FormControl
                        componentClass={"input"}
                        placeholder={"Radius in pixels"}
                        type={"number"}
                        value={maxClusterRadius}
                        onChange={handleChangeMaxClusterRadius}
                      />

                      <Checkbox
                        checked={chunkedLoading}
                        onChange={toggleChunkedLoading}
                      >
                        chunkedLoading
                      </Checkbox>

                    </FormGroup>
                    <JSONstringify object={markerClusterOptions}/>
                  </Tab>

                  <Tab eventKey={'Filters'} title={'Station Filters'}>
                    <Row>
                      <Col lg={12} md={12} sm={12}>
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
                        <SelectionCounts
                          allStations={allStations}
                          selectedStations={selectedStations}
                        />
                        <p>
                          (See Station Metadata and Station Data tabs for details)
                        </p>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={6} md={6} sm={6}>
                        {/*<Button bsSize={'small'} onClick={handleClickAll}>Select all criteria</Button>*/}
                        {/*<Button bsSize={'small'} onClick={handleClickNone}>Clear all criteria</Button>*/}
                        <DateSelector
                          value={startDate}
                          onChange={setStartDate}
                          label={'Start Date'}
                        />
                      </Col>
                      <Col lg={6} md={6} sm={6}>
                        <DateSelector
                          value={endDate}
                          onChange={setEndDate}
                          label={'End Date'}
                        />
                      </Col>
                      <Col lg={12} md={12} sm={12}>
                        <OnlyWithClimatologyControl
                          value={onlyWithClimatology}
                          onChange={toggleOnlyWithClimatology}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={12} md={12} sm={12}>
                        <NetworkSelector
                          allNetworks={allNetworks}
                          onReady={setNetworkActions}
                          value={selectedNetworksOptions}
                          onChange={setSelectedNetworksOptions}
                          isSearchable
                          isClearable={false}
                          styles={commonSelectorStyles}
                        />
                        {/*<JSONstringify object={selectedNetworksOptions}/>*/}
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={12} md={12} sm={12}>
                        <VariableSelector
                          allVariables={allVariables}
                          onReady={setVariableActions}
                          value={selectedVariablesOptions}
                          onChange={setSelectedVariablesOptions}
                          isSearchable
                          isClearable={false}
                          styles={commonSelectorStyles}
                        />
                        {/*<JSONstringify object={selectedVariablesOptions}/>*/}
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={12} md={12} sm={12}>
                        <FrequencySelector
                          allFrequencies={allFrequencies}
                          onReady={setFrequencyActions}
                          value={selectedFrequenciesOptions}
                          onChange={setSelectedFrequenciesOptions}
                          isClearable={false}
                          styles={commonSelectorStyles}
                        />
                        {/*<JSONstringify object={selectedFrequenciesOptions}/>*/}
                      </Col>
                    </Row>
                  </Tab>

                  <Tab eventKey={'Metadata'} title={'Station Metadata'}>
                    <SelectionCounts
                      allStations={allStations}
                      selectedStations={selectedStations}
                    />
                    <StationMetadata
                      stations={selectedStations}
                      allNetworks={allNetworks}
                      allVariables={allVariables}
                    />
                  </Tab>

                  <Tab eventKey={'Data'} title={'Station Data'}>
                    <SelectionCounts
                      allStations={allStations}
                      selectedStations={selectedStations}
                    />
                    <SelectionCriteria/>
                    {
                      unselectedThings &&
                      <p>You haven't selected any {unselectedThings}.</p>
                    }

                    <StationData
                      selectedStations={selectedStations}
                      dataDownloadUrl={dataDownloadUrl}
                      dataDownloadFilename={dataDownloadFilename}
                    />
                  </Tab>

                  <Tab eventKey={'Networks'} title={'Networks'}>
                    <NetworksMetadata networks={allNetworks}/>
                  </Tab>

                </Tabs>
              </Panel.Body>
            </Panel>

          ]}
        />
      </Row>
    </div>
  );
}

export default Body;
