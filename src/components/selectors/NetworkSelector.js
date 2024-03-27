import chroma from "chroma-js";
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
import logger from "@/logger";
import { selectorButtonProps } from "./common";
import LocalPropTypes from "@/components/local-prop-types";
import InfoPopup from "@/components/util/InfoPopup";
import { commonSelectorStyles } from "@/components/selectors/commonSelectorStyles";

import { useNetworks } from "@/state/query-hooks/use-networks";
import { useStationsStore } from "@/state/client/stations-store";

import css from "./common.module.css";

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

export const formatLabels = flow(
  map((network) => ({
    value: network,
    label: `${network.name}`,
    isDisabled: !network.publish,
  })),
  sortBy("label"),
);

export const NetworkSelector = (props) => {
  const { selectedNetworks, setSelectedNetworks } = useStationsStore(
    (state) => ({
      setNetwork: state.setNetwork,
      selectedNetworks: state.selectedNetworks,
      setSelectedNetworks: state.setSelectedNetworks,
    }),
  );

  const { data: networks } = useNetworks();

  const options = useMemo(() => {
    return networks === null ? [] : formatLabels(networks);
  }, [networks]);

  const onChange = (selected) => {
    setSelectedNetworks(map("value.uri", selected));
  };

  const value = options.filter((option) =>
    selectedNetworks.includes(option.value.uri),
  );

  const styles = assign(
    commonSelectorStyles,
    flow(
      toPairs,
      map(([name, style]) => [
        name,
        composeWithRestArgs(style, commonSelectorStyles[name] || identity),
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
        <Button
          {...selectorButtonProps}
          onClick={() =>
            onChange(filter((option) => !option.isDisabled)(options))
          }
        >
          All
        </Button>
        <Button {...selectorButtonProps} onClick={() => onChange([])}>
          None
        </Button>
      </ButtonToolbar>
      <Select
        options={options}
        placeholder={networks ? "Select or type to search..." : "Loading..."}
        isMulti
        isSearchable
        isClearable={false}
        {...{ styles, value, onChange }}
      />
    </Form>
  );
};

NetworkSelector.propTypes = {
  defaultValueSelector: LocalPropTypes.defaultValueSelector,
};

export default NetworkSelector;
