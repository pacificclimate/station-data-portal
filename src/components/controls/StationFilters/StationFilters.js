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

import React from "react";

import "./StationFilters.css";
import { Col, Row } from "react-bootstrap";

import IncludeStationsWithNoObsControl from "../../controls/IncludeStationsWithNoObsControl";
import NetworkSelector from "../../selectors/NetworkSelector";
import VariableSelector from "../../selectors/VariableSelector";
import FrequencySelector from "../../selectors/FrequencySelector/FrequencySelector";
import DateSelector from "../../selectors/DateSelector";
import OnlyWithClimatologyControl from "../../controls/OnlyWithClimatologyControl";
import { commonSelectorStyles } from "../../selectors/styles";
import { usePairedImmerByKey } from "../../../hooks";
import { useNetworks } from "../../../state/query-hooks/use-networks";
import { useVariables } from "../../../state/query-hooks/use-variables";
import { useFrequencies } from "../../../state/query-hooks/use-frequencies";

export const useStationFiltering = () => {
  const { normal, transitional, isPending, setState } = usePairedImmerByKey({
    includeStationsWithNoObs: true,
    startDate: null,
    endDate: null,
    selectedNetworksOptions: [],
    networkActions: null,
    selectedVariablesOptions: [],
    variableActions: null,
    selectedFrequenciesOptions: [],
    frequencyActions: null,
    onlyWithClimatology: false,
  });
  setState.toggleIncludeStationsWithNoObs = () =>
    setState.includeStationsWithNoObs(!normal.includeStationsWithNoObs);
  setState.toggleOnlyWithClimatology = () =>
    setState.onlyWithClimatology(!normal.onlyWithClimatology);
  return { normal, transitional, isPending, setState };
};

function StationFilters({
  state,
  setState,
  rowClasses = { className: "mb-3" },
}) {
  const { data: allNetworks } = useNetworks();
  const { data: allVariables } = useVariables();
  const { data: allFrequencies } = useFrequencies();

  return (
    <React.Fragment>
      <Row {...rowClasses}>
        <Col lg={12} md={12} sm={12}>
          <IncludeStationsWithNoObsControl
            value={state.includeStationsWithNoObs}
            onChange={setState.toggleIncludeStationsWithNoObs}
          />
        </Col>
      </Row>
      <Row {...rowClasses}>
        <Col lg={6} md={6} sm={6}>
          {/*<Button size={'sm'} onClick={handleClickAll}>Select all criteria</Button>*/}
          {/*<Button size={'sm'} onClick={handleClickNone}>Clear all criteria</Button>*/}
          <DateSelector
            label={"Start Date"}
            value={state.startDate}
            onChange={setState.startDate}
            maxDate={state.endDate}
          />
        </Col>
        <Col lg={6} md={6} sm={6}>
          <DateSelector
            label={"End Date"}
            value={state.endDate}
            onChange={setState.endDate}
            minDate={state.startDate}
          />
        </Col>
      </Row>
      <Row {...rowClasses}>
        <Col lg={12} md={12} sm={12}>
          <OnlyWithClimatologyControl
            value={state.onlyWithClimatology}
            onChange={setState.toggleOnlyWithClimatology}
          />
        </Col>
      </Row>
      <Row {...rowClasses}>
        <Col lg={12} md={12} sm={12}>
          <NetworkSelector
            allNetworks={allNetworks}
            onReady={setState.networkActions}
            value={state.selectedNetworksOptions}
            onChange={setState.selectedNetworksOptions}
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
            onReady={setState.variableActions}
            value={state.selectedVariablesOptions}
            onChange={setState.selectedVariablesOptions}
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
            onReady={setState.frequencyActions}
            value={state.selectedFrequenciesOptions}
            onChange={setState.selectedFrequenciesOptions}
            isClearable={false}
            styles={commonSelectorStyles}
          />
          {/*<JSONstringify object={selectedFrequenciesOptions}/>*/}
        </Col>
      </Row>
    </React.Fragment>
  );
}

StationFilters.propTypes = {};

export default StationFilters;
