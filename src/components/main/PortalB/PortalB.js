import React, { Component } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { FeatureGroup, LayerGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import memoize from 'memoize-one';
import {
  flow,
  map,
  filter,
  flatten,
  uniq,
  intersection,
  contains,
  pick,
  join,
  tap
} from 'lodash/fp';

import { BCBaseMap } from 'pcic-react-leaflet-components';

import './PortalB.css';

import logger from '../../../logger';
import NetworkSelector from '../../selectors/NetworkSelector';
import StationMarkers from '../../maps/StationMarkers';
import {
  getNetworks,
  getVariables,
  getStations,
} from '../../../data-services/station-data-service';
import VariableSelector from '../../selectors/VariableSelector';
import JSONstringify from '../../util/JSONstringify';
import FrequencySelector from '../../selectors/FrequencySelector/FrequencySelector';

logger.configure({ active: true });


const commonSelectorStyles = {
  valueContainer: (provided, state) => ({
    ...provided,
    maxHeight: '10em',
    overflowY: 'auto',
    zIndex: '9999',
  }),
  indicatorsContainer: (provided, state) => ({
    width: '2em',
    // display: 'none'
  }),
};


class Portal extends Component {
  state = {
    allNetworks: null,
    selectedNetworks: [],
    networkActions: {},

    allVariables: null,
    selectedVariables: [],
    variableActions: {},

    selectedFrequencies: [],
    frequencyActions: {},

    allStations: null,
  };

  handleChange = (name, value) => this.setState({ [name]: value });

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

  componentDidMount() {
    getNetworks().then(response => this.setState({ allNetworks: response.data }));
    getVariables().then(response => this.setState({ allVariables: response.data }));
    getStations({
      params: {
        // limit: 1000,
        stride: 50,  // load every 10th station
      },
    })
    .then(response => this.setState({ allStations: response.data }));
  }

  filteredStations = memoize(
    (selectedNetworks, selectedVariables, selectedFrequencies, allStations) => {
      // console.log('filteredStations allStations', allStations)
      // console.log('filteredStations allVariables', this.state.allVariables)
      const selectedVariableUris = flow(
        map(selectedVariable => selectedVariable.contexts),
        flatten,
        map(context => context.uri),
        uniq,
      )(selectedVariables);
      // console.log('filteredStations selectedVariableUris', selectedVariableUris)
      const selectedFrequencyValues =
        map(option => option.value)(selectedFrequencies);
      // console.log('filteredStations selectedVariableUris', selectedVariableUris)
      return flow(
        filter(
          station => {
            return (
              contains(
                station.network_uri,
                map(nw => nw.value.uri)(selectedNetworks)
              ) && (
                station.histories && station.histories[0] &&
                intersection(station.histories[0].variable_uris, selectedVariableUris).length > 0
              ) && (
                station.histories && station.histories[0] &&
                contains(station.histories[0].freq, selectedFrequencyValues)
              )
            )
          }
        ),
      )(allStations);
    }
  );

  render() {
    const filteredStations = this.filteredStations(
      this.state.selectedNetworks,
      this.state.selectedVariables,
      this.state.selectedFrequencies,
      this.state.allStations
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
      <React.Fragment>
        <Row>
          <Col lg={2} md={2} sm={2}>
            <p>{
              this.state.allStations ?
                `${this.state.allStations.length} stations available.` :
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
              this.state.allStations &&
              <p>{`${filteredStations.length || 'No'} stations match criteria.`}</p>
            }
            {
              unselectedThings &&
              <p>You haven't selected any {unselectedThings}.</p>
            }
            <Button bsSize={'small'} onClick={this.handleClickAll}>Select all criteria</Button>
            <Button bsSize={'small'} onClick={this.handleClickNone}>Clear all criteria</Button>
          </Col>

          <Col lg={4} md={4} sm={4}>
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
          <Col lg={4} md={4} sm={4}>
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
          <Col lg={2} md={2} sm={2}>
            <FrequencySelector
              onReady={this.handleFrequencySelectorReady}
              value={this.state.selectedFrequencies}
              onChange={this.handleChangeFrequency}
              isClearable={false}
              styles={commonSelectorStyles}
            />
            {/*<JSONstringify object={this.state.selectedFrequencies}/>*/}
          </Col>
        </Row>

        <Row>
          <Col lg={9} md={8} sm={12} className="Map">
            <BCBaseMap viewport={BCBaseMap.initialViewport}>
              <FeatureGroup>
                <EditControl
                  position={'topleft'}
                />
              </FeatureGroup>
              <LayerGroup>
                <StationMarkers
                  stations={filteredStations}
                  allNetworks={this.state.allNetworks}
                  allVariables={this.state.allVariables}
                />
              </LayerGroup>
            </BCBaseMap>
          </Col>
          <Col lg={3} md={4} sm={12} className="Data">
            <Row>
              Download
            </Row>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

export default Portal;
