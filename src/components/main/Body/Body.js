import React, { Component } from 'react';
import { Col, Panel, Row, Tab, Tabs } from 'react-bootstrap';
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
  stationFilter,
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


class Body extends Component {
  state = {
    startDate: null,
    endDate: null,

    allNetworks: null,
    selectedNetworksOptions: [],
    networkActions: null,

    allVariables: null,
    selectedVariablesOptions: [],
    variableActions: null,

    selectedFrequenciesOptions: [],
    frequencyActions: null,

    onlyWithClimatology: false,

    allStations: null,

    fileFormat: undefined,
    clipToDate: false,

    area: undefined,
  };

  handleChange = (name, value) => this.setState({ [name]: value });
  toggleBoolean = name =>
    this.setState(state => ({ [name]: !state[name] }));

  handleChangeStartDate = this.handleChange.bind(this, 'startDate');
  handleChangeEndDate = this.handleChange.bind(this, 'endDate');

  handleChangeNetwork = this.handleChange.bind(this, 'selectedNetworksOptions');
  handleNetworkSelectorReady = this.handleChange.bind(this, 'networkActions');

  handleChangeVariable = this.handleChange.bind(this, 'selectedVariablesOptions');
  handleVariableSelectorReady = this.handleChange.bind(this, 'variableActions');

  handleChangeFrequency = this.handleChange.bind(this, 'selectedFrequenciesOptions');
  handleFrequencySelectorReady = this.handleChange.bind(this, 'frequencyActions');

  handleClickAll = () => {
    this.state.networkActions.selectAll();
    this.state.variableActions.selectAll();
    this.state.frequencyActions.selectAll();
  };
  handleClickNone = () => {
    this.state.networkActions.selectNone();
    this.state.variableActions.selectNone();
    this.state.frequencyActions.selectNone();
  };

  handleChangeFileFormat = this.handleChange.bind(this, 'fileFormat');

  toggleClipToDate = this.toggleBoolean.bind(this, 'clipToDate');
  toggleOnlyWithClimatology =
    this.toggleBoolean.bind(this, 'onlyWithClimatology');

  handleSetArea = this.handleChange.bind(this, 'area');

  componentDidMount() {
    getNetworks()
      .then(response => this.setState({ allNetworks: response.data }));
    getVariables()
      .then(response => this.setState({ allVariables: response.data }));
    getStations()
    .then(response => this.setState({ allStations: response.data }));
  }

  stationFilter = memoize(stationFilter);

  dataDownloadUrl = ({ dataCategory, clipToDate, fileFormat }) => {
    // Check whether state has settled. Each selector calls an onReady callback
    // to export information (e.g., all its options) that it has set up
    // internally. In retrospect, this is a too-clever solution to the problem
    // of passing a pile of props around, but it's what we've got.
    if (
      !this.state.networkActions
      || !this.state.variableActions
      || !this.state.frequencyActions
    ) {
      return "#";
    }

    return dataDownloadTarget({
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      selectedNetworksOptions: this.state.selectedNetworksOptions,
      selectedVariablesOptions: this.state.selectedVariablesOptions,
      selectedFrequenciesOptions: this.state.selectedFrequenciesOptions,
      polygon: this.state.area,
      onlyWithClimatology: this.state.onlyWithClimatology,
      allNetworks: this.state.networkActions.getAllOptions(),
      allVariables: this.state.variableActions.getAllOptions(),
      allFrequencies: this.state.frequencyActions.getAllOptions(),
      dataCategory,
      clipToDate,
      dataFormat: fileFormat,
    });
  };

  dataDownloadFilename = ({ dataCategory, fileFormat }) => {
    return `${{ dataCategory, fileFormat }}.${get('value', fileFormat)}`;
  }

  render() {
    console.log("### Body render", this.state)
    const filteredStations = this.stationFilter(
      this.state.startDate,
      this.state.endDate,
      this.state.selectedNetworksOptions,
      this.state.selectedVariablesOptions,
      this.state.selectedFrequenciesOptions,
      this.state.onlyWithClimatology,
      this.state.area,
      this.state.allNetworks,
      this.state.allVariables,
      this.state.allStations,
    );

    const stationInsideArea = stationInsideMultiPolygon(this.state.area);
    const selectedStations = filter(stationInsideArea, filteredStations);

    const selections = [
      {
        name: 'networks',
        items: this.state.selectedNetworksOptions,
      },
      {
        name: 'variables',
        items: this.state.selectedVariablesOptions,
      },
      {
        name: 'frequencies',
        items: this.state.selectedFrequenciesOptions,
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
              <StationMap
                {...baseMaps[process.env.REACT_APP_BASE_MAP]}
                stations={filteredStations}
                allNetworks={this.state.allNetworks}
                allVariables={this.state.allVariables}
                onSetArea={this.handleSetArea}
              />,

              <Panel style={{ marginLeft: '-15px', marginRight: '-10px' }}>
                <Panel.Body>
                  <Tabs defaultActiveKey={'Filters'} className={css.mainTabs}>
                    <Tab eventKey={'Filters'} title={'Station Filters'}>
                      <Row>
                        <Col lg={12} md={12} sm={12}>
                          <SelectionCounts
                            allStations={this.state.allStations}
                            selectedStations={selectedStations}
                          />
                          <p>
                            (See Station Metadata and Station Data tabs for details)
                          </p>
                        </Col>
                      </Row>
                      <Row>
                        <Col lg={6} md={6} sm={6}>
                          {/*<Button bsSize={'small'} onClick={this.handleClickAll}>Select all criteria</Button>*/}
                          {/*<Button bsSize={'small'} onClick={this.handleClickNone}>Clear all criteria</Button>*/}
                          <DateSelector
                            value={this.state.startDate}
                            onChange={this.handleChangeStartDate}
                            label={'Start Date'}
                          />
                        </Col>
                        <Col lg={6} md={6} sm={6}>
                          <DateSelector
                            value={this.state.endDate}
                            onChange={this.handleChangeEndDate}
                            label={'End Date'}
                          />
                        </Col>
                        <Col lg={12} md={12} sm={12}>
                          <OnlyWithClimatologyControl
                            value={this.state.onlyWithClimatology}
                            onChange={this.toggleOnlyWithClimatology}
                          />
                        </Col>
                      </Row>
                      <Row>
                        <Col lg={12} md={12} sm={12}>
                          <NetworkSelector
                            allNetworks={this.state.allNetworks}
                            onReady={this.handleNetworkSelectorReady}
                            value={this.state.selectedNetworksOptions}
                            onChange={this.handleChangeNetwork}
                            isSearchable
                            isClearable={false}
                            styles={commonSelectorStyles}
                          />
                          {/*<JSONstringify object={this.state.selectedNetworksOptions}/>*/}
                        </Col>
                      </Row>
                      <Row>
                        <Col lg={12} md={12} sm={12}>
                          <VariableSelector
                            allVariables={this.state.allVariables}
                            onReady={this.handleVariableSelectorReady}
                            value={this.state.selectedVariablesOptions}
                            onChange={this.handleChangeVariable}
                            isSearchable
                            isClearable={false}
                            styles={commonSelectorStyles}
                          />
                          {/*<JSONstringify object={this.state.selectedVariablesOptions}/>*/}
                        </Col>
                      </Row>
                      <Row>
                        <Col lg={12} md={12} sm={12}>
                          <FrequencySelector
                            allStations={this.state.allStations}
                            onReady={this.handleFrequencySelectorReady}
                            value={this.state.selectedFrequenciesOptions}
                            onChange={this.handleChangeFrequency}
                            isClearable={false}
                            styles={commonSelectorStyles}
                          />
                          {/*<JSONstringify object={this.state.selectedFrequenciesOptions}/>*/}
                        </Col>
                      </Row>
                    </Tab>

                    <Tab eventKey={'Metadata'} title={'Station Metadata'}>
                      <SelectionCounts
                        allStations={this.state.allStations}
                        selectedStations={selectedStations}
                      />
                      <StationMetadata
                        stations={selectedStations}
                        allNetworks={this.state.allNetworks}
                        allVariables={this.state.allVariables}
                      />
                    </Tab>

                    <Tab eventKey={'Data'} title={'Station Data'}>
                      <SelectionCounts
                        allStations={this.state.allStations}
                        selectedStations={selectedStations}
                      />
                      <SelectionCriteria/>
                      {
                        unselectedThings &&
                        <p>You haven't selected any {unselectedThings}.</p>
                      }

                      <StationData
                        selectedStations={selectedStations}
                        dataDownloadUrl={this.dataDownloadUrl}
                        dataDownloadFilename={this.dataDownloadFilename}
                      />
                    </Tab>

                    <Tab eventKey={'Networks'} title={'Networks'}>
                      <NetworksMetadata networks={this.state.allNetworks}/>
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
}

export default Body;