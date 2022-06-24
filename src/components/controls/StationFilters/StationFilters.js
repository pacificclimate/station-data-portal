// This module packages up the state, state setters, and controls needed for
// station filtering.
//
// State and setters are provided by a custom hook, useStationFiltering.
//
// Controls are provided by a functional component StationFilters. This
// component does not invoke the hook nor have any state of its own; it
// receives the hooks results (state and setters) from the the client component
// (<Body>), which does invoke the hook. This enables the client component
// to use the state.
//
// This module does not really hide anything from the client, but it hides the
// complexity, and it places the state declarations right next to their primary
// usage in the component, which makes it easier to maintain.

import React, { useState } from 'react';

import './StationFilters.css';
import { Col, Row } from 'react-bootstrap';
import NetworkSelector from '../../selectors/NetworkSelector';
import VariableSelector from '../../selectors/VariableSelector';
import FrequencySelector
  from '../../selectors/FrequencySelector/FrequencySelector';
import DateSelector from '../../selectors/DateSelector';
import OnlyWithClimatologyControl
  from '../../controls/OnlyWithClimatologyControl';
import { commonSelectorStyles } from '../../selectors/styles';

export const useStationFiltering = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedNetworksOptions, setSelectedNetworksOptions] = useState([]);
  const [networkActions, setNetworkActions] = useState(null);
  const [selectedVariablesOptions, setSelectedVariablesOptions] = useState([]);
  const [variableActions, setVariableActions] = useState(null);
  const [selectedFrequenciesOptions, setSelectedFrequenciesOptions] = useState([]);
  const [frequencyActions, setFrequencyActions] = useState(null);
  const [onlyWithClimatology, setOnlyWithClimatology] = useState(false);
  const toggleOnlyWithClimatology = () =>
    setOnlyWithClimatology(!onlyWithClimatology);
  // TODO: Remove? Not presently used, but there is commented out code
  //  in StationFilters that uses these.
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


  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedNetworksOptions,
    setSelectedNetworksOptions,
    networkActions,
    setNetworkActions,
    selectedVariablesOptions,
    setSelectedVariablesOptions,
    variableActions,
    setVariableActions,
    selectedFrequenciesOptions,
    setSelectedFrequenciesOptions,
    frequencyActions,
    setFrequencyActions,
    onlyWithClimatology,
    toggleOnlyWithClimatology,
  };
};

function StationFilters({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  allNetworks,
  selectedNetworksOptions,
  setSelectedNetworksOptions,
  networkActions,
  setNetworkActions,
  allVariables,
  selectedVariablesOptions,
  setSelectedVariablesOptions,
  variableActions,
  setVariableActions,
  allFrequencies,
  selectedFrequenciesOptions,
  setSelectedFrequenciesOptions,
  frequencyActions,
  setFrequencyActions,
  onlyWithClimatology,
  toggleOnlyWithClimatology,
  rowClasses = { className: "mb-3" },
}) {
  return (
    <React.Fragment>
      <Row {...rowClasses}>
        <Col lg={6} md={6} sm={6}>
          {/*<Button size={'sm'} onClick={handleClickAll}>Select all criteria</Button>*/}
          {/*<Button size={'sm'} onClick={handleClickNone}>Clear all criteria</Button>*/}
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
      </Row>
      <Row {...rowClasses}>
        <Col lg={12} md={12} sm={12}>
          <OnlyWithClimatologyControl
            value={onlyWithClimatology}
            onChange={toggleOnlyWithClimatology}
          />
        </Col>
      </Row>
      <Row {...rowClasses}>
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
      <Row {...rowClasses}>
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
      <Row {...rowClasses}>
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
    </React.Fragment>
  );
}

StationFilters.propTypes = {
};

export default StationFilters;
