import React, { Component } from 'react';
import { Button, Col, Panel, Row, Tab, Tabs } from 'react-bootstrap';
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
import FileFormatSelector from '../../selectors/FileFormatSelector';
import ClipToDateControl from '../../controls/ClipToDateControl';
import ObservationCounts from '../../info/ObservationCounts';
import { stationFilter } from '../../../utils/portals-common';
import ButtonToolbar from 'react-bootstrap/es/ButtonToolbar';
import StationMetadata from '../../info/StationMetadata';
import OnlyWithClimatologyControl
  from '../../controls/OnlyWithClimatologyControl';
import StationMap from '../../maps/StationMap';
import AdjustableColumns from '../../util/AdjustableColumns';
import capitalize from 'react-bootstrap/lib/utils/capitalize';
import baseMaps from '../../maps/baseMaps';
import NetworksMetadata from '../../info/NetworksMetadata';


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


class Portal extends Component {
  state = {
    startDate: null,
    endDate: null,

    // TODO: Rename things here to make obvious the distinction between
    //  things (e.g., networks) proper, from the backend API, and selector
    //  options derived from them.
    allNetworks: null,
    selectedNetworks: [],
    networkActions: null,

    allVariables: null,
    selectedVariables: [],
    variableActions: null,

    selectedFrequencies: [],
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

  handleChangeNetwork = this.handleChange.bind(this, 'selectedNetworks');
  handleNetworkSelectorReady = this.handleChange.bind(this, 'networkActions');

  handleChangeVariable = this.handleChange.bind(this, 'selectedVariables');
  handleVariableSelectorReady = this.handleChange.bind(this, 'variableActions');

  handleChangeFrequency = this.handleChange.bind(this, 'selectedFrequencies');
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

  dataDownloadUrl = dataCategory => {
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
      networks: this.state.selectedNetworks,
      variables: this.state.selectedVariables,
      frequencies: this.state.selectedFrequencies,
      polygon: this.state.area,
      clipToDate: this.state.clipToDate,
      onlyWithClimatology: this.state.onlyWithClimatology,
      dataCategory,
      dataFormat: this.state.fileFormat,
      allNetworks: this.state.networkActions.getAllOptions(),
      allVariables: this.state.variableActions.getAllOptions(),
      allFrequencies: this.state.frequencyActions.getAllOptions(),
    });
  };

  dataDownloadFilename = id => {
    return `${id}.${get('value', this.state.fileFormat)}`;
  }

  render() {
    console.log("### VersionA render", this.state)
    const filteredStations = this.stationFilter(
      this.state.startDate,
      this.state.endDate,
      this.state.selectedNetworks,
      this.state.selectedVariables,
      this.state.selectedFrequencies,
      this.state.onlyWithClimatology,
      this.state.area,
      this.state.allNetworks,
      this.state.allVariables,
      this.state.allStations,
    );

    const selections = [
      {
        name: 'networks',
        items: this.state.selectedNetworks,
      },
      {
        name: 'variables',
        items: this.state.selectedVariables,
      },
      {
        name: 'frequencies',
        items: this.state.selectedFrequencies,
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
                            value={this.state.selectedNetworks}
                            onChange={this.handleChangeNetwork}
                            isSearchable
                            isClearable={false}
                            styles={commonSelectorStyles}
                          />
                          {/*<JSONstringify object={this.state.selectedNetworks}/>*/}
                        </Col>
                      </Row>
                      <Row>
                        <Col lg={12} md={12} sm={12}>
                          <VariableSelector
                            allVariables={this.state.allVariables}
                            onReady={this.handleVariableSelectorReady}
                            value={this.state.selectedVariables}
                            onChange={this.handleChangeVariable}
                            isSearchable
                            isClearable={false}
                            styles={commonSelectorStyles}
                          />
                          {/*<JSONstringify object={this.state.selectedVariables}/>*/}
                        </Col>
                      </Row>
                      <Row>
                        <Col lg={12} md={12} sm={12}>
                          <FrequencySelector
                            allStations={this.state.allStations}
                            onReady={this.handleFrequencySelectorReady}
                            value={this.state.selectedFrequencies}
                            onChange={this.handleChangeFrequency}
                            isClearable={false}
                            styles={commonSelectorStyles}
                          />
                          {/*<JSONstringify object={this.state.selectedFrequencies}/>*/}
                        </Col>
                      </Row>
                    </Tab>

                    <Tab eventKey={'Metadata'} title={'Station Metadata'}>
                      <Button disabled>
                        Download Metadata
                      </Button>

                      <p>{filteredStations.length} stations selected</p>
                      <StationMetadata
                        stations={filteredStations}
                        allNetworks={this.state.allNetworks}
                      />

                    </Tab>

                    <Tab eventKey={'Data'} title={'Station Data'}>
                      <p>{
                        this.state.allStations ?
                          `${filteredStations.length} stations selected of
                    ${this.state.allStations ? this.state.allStations.length : 0} available` :
                          `Loading station info ... (this may take a couple of minutes)`
                      }</p>
                      <p>{`
              Available stations are filtered by
              the network they are part of,
              the variable(s) they observe,
              and the frequency of obervation.
              Stations matching selected criteria are displayed on the map.
              `}</p>
                      {
                        unselectedThings &&
                        <p>You haven't selected any {unselectedThings}.</p>
                      }

                      <ObservationCounts stations={filteredStations}/>

                      <FileFormatSelector
                        value={this.state.fileFormat}
                        onChange={this.handleChangeFileFormat}
                      />

                      <ClipToDateControl
                        value={this.state.clipToDate}
                        onChange={this.toggleClipToDate}
                      />

                      <ButtonToolbar>
                        {
                          map(
                            id => (
                              <a
                                href={this.dataDownloadUrl(id)}
                                download={this.dataDownloadFilename(id)}
                                className="btn btn-primary"
                              >
                                Download {capitalize(id)}
                              </a>
                            ),
                            ['timeseries', 'climatology']
                          )
                        }
                      </ButtonToolbar>

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

export default Portal;
