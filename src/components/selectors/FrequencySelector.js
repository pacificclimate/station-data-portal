import React, { useEffect } from "react";
import { Button, ButtonToolbar, Form } from "react-bootstrap";
import Select from "react-select";
import logger from "@/logger";
import LocalPropTypes from "../local-prop-types";
import capitalize from "lodash/fp/capitalize";
import flow from "lodash/fp/flow";
import get from "lodash/fp/get";
import map from "lodash/fp/map";
import sortBy from "lodash/fp/sortBy";
import InfoPopup from "@/components/util/InfoPopup/InfoPopup";
import { defaultValue, selectorButtonProps } from "./common";
import { commonSelectorStyles } from "@/components/selectors/commonSelectorStyles";
import useFrequencies from "@/state/query-hooks/use-frequencies";
import { useStationsStore } from "@/state/client/stations-store";

import css from "./common.module.css";

logger.configure({ active: true });

export const valueToLabel = (freq) => {
  const labels = {
    "1-hourly": "Hourly",
    "12-hourly": "Semi-daily",
  };
  return get(freq, labels) || capitalize(freq) || "Unspecified";
};

export const getOptions = (frequencies) => {
  return frequencies === null
    ? []
    : flow(
        map((frequency) => ({
          value: frequency,
          label: valueToLabel(frequency),
        })),
        sortBy("label"),
      )(frequencies);
};

function FrequencySelector() {
  const { data: frequencies } = useFrequencies();
  const { setSelectedFrequencies, selectedFrequencies } = useStationsStore(
    (state) => ({
      setSelectedFrequencies: state.setSelectedFrequencies,
      selectedFrequencies: state.selectedFrequencies,
    }),
  );

  const onChange = (selected) => {
    setSelectedFrequencies(map("value", selected));
  };

  const value = getOptions(frequencies).filter((option) =>
    selectedFrequencies.includes(option.value),
  );

  return (
    <Form>
      <div>
        <Form.Label>Observation Frequency</Form.Label>{" "}
        <InfoPopup title={"Observation Frequency multiselector"}>
          <ul className={"compact"}>
            <li>At startup, all frequencies are selected.</li>
            <li>
              Use the None button to clear all frequencies from the selector.
            </li>
            <li>
              Use the All button to add all available frequencies to the
              selector.
            </li>
            <li>
              Click the dropdown and select an item to add a single unselected
              frequency.
            </li>
            <li>Click the X next to a selected frequency to remove it.</li>
          </ul>
        </InfoPopup>
      </div>
      <ButtonToolbar className={css.selectorButtons}>
        <Button {...selectorButtonProps} onClick={() => onChange(getOptions())}>
          All
        </Button>
        <Button {...selectorButtonProps} onClick={() => onChange([])}>
          None
        </Button>
      </ButtonToolbar>
      <Select
        options={getOptions(frequencies)}
        placeholder={frequencies ? "Select or type to search..." : "Loading..."}
        {...{ value, onChange }}
        isMulti
        isSearchable
        isClearable={false}
        styles={commonSelectorStyles}
      />
    </Form>
  );
}

export default FrequencySelector;
