// This module packages up the state, state setters, and controls needed for
// station filtering.
//
// State and setters are returned by a custom hook, `useStationFiltering`.
//
// Controls are provided by the component `StationFilters`. This
// component does not invoke the hook or have any state of its own; it
// receives the hook returns (state and setters) from the client component
// (<Body>), which does invoke the hook. This enables the client component
// to feed the hook outputs into `StationFilters` and to use the state for
// other purposes, such as performing actual station filtering, which is
// *not* done by anything in this module.
//
// Additionally, `useStationFiltering` provides an `isPending` state, which is
// true if and only if updates due to invoking the setters are in progress.
// It uses the new (as of React 18) concurrency hook `useTransition`, which
// proves pretty magical.
//
// The hook and the component `StationFilters` are a matched pair.
// This module does not hide much from its client(s), but it hides a bit of
// complexity, and it places the state declarations right next to a key
// consumer of them, the component `StationFilters`.

import React, { useState, useTransition } from 'react';

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

  // Define a transition such that updates to the filtering parameters are
  // marked as lower priority.
  const [isPending, startTransition] = useTransition();

  // This function wraps a setter in a transition. Evidently it is OK to wrap
  // different, independently-called setters in the same transition.
  const handleAsTransition = setter => value => {
    startTransition(() => setter(value));
  };

  return {
    startDate,
    setStartDate: handleAsTransition(setStartDate),
    endDate,
    setEndDate: handleAsTransition(setEndDate),
    selectedNetworksOptions,
    setSelectedNetworksOptions: handleAsTransition(setSelectedNetworksOptions),
    networkActions,
    setNetworkActions,
    selectedVariablesOptions,
    setSelectedVariablesOptions:
      handleAsTransition(setSelectedVariablesOptions),
    variableActions,
    setVariableActions,
    selectedFrequenciesOptions,
    setSelectedFrequenciesOptions:
      handleAsTransition(setSelectedFrequenciesOptions),
    frequencyActions,
    setFrequencyActions,
    onlyWithClimatology,
    toggleOnlyWithClimatology: handleAsTransition(toggleOnlyWithClimatology),
    isPending,
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
