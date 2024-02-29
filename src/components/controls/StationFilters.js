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
import { Col, Row } from "react-bootstrap";

import SelectionCounts from "@/components/info/SelectionCounts";
import IncludeStationsWithNoObsControl from "@/components/controls/IncludeStationsWithNoObsControl";
import NetworkSelector from "@/components/selectors/NetworkSelector";
import VariableSelector from "@/components/selectors/VariableSelector";
import FrequencySelector from "@/components/selectors/FrequencySelector";
import DateSelector from "@/components/selectors/DateSelector";
import OnlyWithClimatologyControl from "@/components/controls/OnlyWithClimatologyControl";
import { useVariables } from "@/state/query-hooks/use-variables";
import { useFrequencies } from "@/state/query-hooks/use-frequencies";
import { useStationsStore } from "@/state/client/stations-store";
import { useStore } from "@/state/client/state-store";
import { useConfigContext } from "@/state/context-hooks/use-config-context";

function StationFilters({ rowClasses = "mb-3" }) {
  const config = useConfigContext();
  const { data: allVariables } = useVariables();
  const { data: allFrequencies } = useFrequencies();
  const { startDate, endDate, setStartDate, setEndDate } = useStationsStore(
    (state) => ({
      // dates
      startDate: state.startDate,
      endDate: state.endDate,
      setStartDate: state.setStartDate,
      setEndDate: state.setEndDate,
    }),
  );
  const { stationsLimit, setStationsLimit } = useStore((state) => ({
    stationsLimit: state.stationsLimit,
    setStationsLimit: state.setStationsLimit,
  }));

  return (
    <>
      {config.stationDebugFetchOptions && (
        <Row>
          <Col lg={6}>Fetch limit</Col>
          <Col lg={6}>
            <Select
              options={config.stationDebugFetchLimitsOptions}
              value={stationsLimit}
              onChange={setStationsLimit}
            />
          </Col>
        </Row>
      )}
      <Row className={rowClasses}>
        <Col lg={12} md={12} sm={12}>
          <SelectionCounts />
          <p className={"mb-0"}>
            (See Station Metadata and Station Data tabs for details)
          </p>
        </Col>
      </Row>
      <Row className={rowClasses}>
        <Col lg={12} md={12} sm={12}>
          <IncludeStationsWithNoObsControl />
        </Col>
      </Row>
      <Row className={rowClasses}>
        <Col lg={6} md={6} sm={6}>
          {/*<Button size={'sm'} onClick={handleClickAll}>Select all criteria</Button>*/}
          {/*<Button size={'sm'} onClick={handleClickNone}>Clear all criteria</Button>*/}
          <DateSelector
            label={"Start Date"}
            value={startDate}
            onChange={setStartDate}
            maxDate={endDate}
          />
        </Col>
        <Col lg={6} md={6} sm={6}>
          <DateSelector
            label={"End Date"}
            value={endDate}
            onChange={setEndDate}
            minDate={startDate}
          />
        </Col>
      </Row>
      <Row className={rowClasses}>
        <Col lg={12} md={12} sm={12}>
          <OnlyWithClimatologyControl />
        </Col>
      </Row>
      <Row className={rowClasses}>
        <Col lg={12} md={12} sm={12}>
          <NetworkSelector />
          {/*<JSONstringify object={selectedNetworksOptions}/>*/}
        </Col>
      </Row>
      <Row className={rowClasses}>
        <Col lg={12} md={12} sm={12}>
          <VariableSelector />
          {/*<JSONstringify object={selectedVariablesOptions}/>*/}
        </Col>
      </Row>
      <Row className={rowClasses}>
        <Col lg={12} md={12} sm={12}>
          <FrequencySelector />
          {/*<JSONstringify object={selectedFrequenciesOptions}/>*/}
        </Col>
      </Row>
    </>
  );
}

StationFilters.propTypes = {};

export default StationFilters;
