import PropTypes from "prop-types";
import React, { useEffect, useMemo } from "react";
import { Button, ButtonToolbar, Form } from "react-bootstrap";
import Select from "react-select";
import map from "lodash/fp/map";
import flow from "lodash/fp/flow";
import filter from "lodash/fp/filter";
import sortBy from "lodash/fp/sortBy";
import toPairs from "lodash/fp/toPairs";
import fromPairs from "lodash/fp/fromPairs";
import identity from "lodash/fp/identity";
import assign from "lodash/fp/assign";

import { composeWithRestArgs } from "@/utils/fp/fp";
import chroma from "chroma-js";
import logger from "@/logger";
import { defaultValue, selectorButtonProps } from "../common";
import LocalPropTypes from "@/components/local-prop-types";
import InfoPopup from "@/components/util/InfoPopup";

import css from "../common.module.css";

logger.configure({ active: true });

const localStyles = {
  option: (styles, { value, isDisabled }) => {
    const color = chroma(value.color || "#000000");
    return {
      ...styles,
      backgroundColor: isDisabled ? null : color.alpha(0.5).css(),
      borderBottom: "1px solid #aaa",
    };
  },
  multiValue: (styles, { data: { value, isDisabled } }) => {
    const color = chroma(value.color || "#000000");
    return {
      ...styles,
      backgroundColor: isDisabled ? null : color.alpha(0.5).css(),
    };
  },
};

const formatLabels = flow(
  map((network) => ({
    value: network,
    label: `${network.name}`,
    isDisabled: !network.publish,
  })),
  sortBy("label"),
);

const NetworkSelector = (props) => {
  const {
    allNetworks,
    onReady = () => null,
    value,
    onChange,
    defaultValueSelector = "all",
    styles,
  } = props;
  const options = useMemo(() => {
    return allNetworks === null ? [] : formatLabels(allNetworks);
  }, [allNetworks]);

  useEffect(() => {
    setDefault();
  }, [allNetworks]);

  useEffect(() => {
    const actions = {
      getAllOptions: () => options,
      selectAll: handleClickAll,
      selectNone: handleClickNone,
    };
    onReady(actions);
  }, []);

  const setDefault = () => {
    onChange(defaultValue(defaultValueSelector, options));
  };

  const handleClickAll = () =>
    onChange(filter((option) => !option.isDisabled)(options));

  const handleClickNone = () => onChange([]);

  const composedStyles = assign(
    styles,
    flow(
      toPairs,
      map(([name, style]) => [
        name,
        composeWithRestArgs(style, styles[name] || identity),
      ]),
      fromPairs,
    )(localStyles),
  );

  return (
    <Form>
      <div>
        <Form.Label>Network</Form.Label>{" "}
        <InfoPopup title={"Network multiselector"}>
          <ul className={"compact"}>
            <li>At startup, all networks are selected.</li>
            <li>
              Use the None button to clear all networks from the selector.
            </li>
            <li>
              Use the All button to add all available networks to the selector.
            </li>
            <li>
              Click the dropdown and select an item to add a single unselected
              network.
            </li>
            <li>Click the X next to a selected network to remove it.</li>
          </ul>
        </InfoPopup>
      </div>
      <ButtonToolbar className={css.selectorButtons}>
        <Button {...selectorButtonProps} onClick={handleClickAll}>
          All
        </Button>
        <Button {...selectorButtonProps} onClick={handleClickNone}>
          None
        </Button>
      </ButtonToolbar>
      <Select
        options={options}
        placeholder={allNetworks ? "Select or type to search..." : "Loading..."}
        {...props}
        styles={composedStyles}
        isMulti
      />
    </Form>
  );
};

NetworkSelector.propTypes = {
  allNetworks: PropTypes.array,
  onReady: PropTypes.func,
  value: PropTypes.array, // can be null
  onChange: PropTypes.func.isRequired,
  defaultValueSelector: LocalPropTypes.defaultValueSelector,
};

export default NetworkSelector;
