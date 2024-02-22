import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Button, ButtonToolbar, Form } from "react-bootstrap";
import Select from "react-select";
import map from "lodash/fp/map";
import filter from "lodash/fp/filter";
import flatten from "lodash/fp/flatten";
import some from "lodash/fp/some";
import includes from "lodash/fp/includes";
import sortBy from "lodash/fp/sortBy";
import flow from "lodash/fp/flow";
import tap from "lodash/fp/tap";
import { groupByGeneral } from "@/utils/fp/fp";
import { defaultValue, selectorButtonProps } from "../common";
import logger from "@/logger";
import InfoPopup from "@/components/util/InfoPopup";
import LocalPropTypes from "@/components/local-prop-types";

import css from "../common.module.css";

logger.configure({ active: true });

// TODO: Update pcic-react-components GroupingSelector to communicate options
// and reuse here? Right now there is a lot of repetition of function.

const flattenOptions = flow(
  map((group) => group.options),
  flatten,
  filter((option) => !option.isDisabled),
);

const types = [
  {
    condition: some(
      (context) =>
        includes("temperature", context.short_name) &&
        !includes("dew_point", context.short_name),
    ),
    value: {
      label: "Temperature",
      code: "temperature",
    },
  },
  {
    condition: some(
      (context) =>
        includes("precipitation", context.short_name) ||
        includes("rain", context.short_name) ||
        includes("snow", context.short_name),
    ),
    value: {
      label: "Precipitation",
      code: "precipitation",
    },
  },
  {
    condition: some(
      (context) =>
        includes("humidity", context.short_name) ||
        includes("dew_point", context.short_name),
    ),
    value: {
      label: "Humidity",
      code: "humidity",
    },
  },
  {
    condition: some((context) => includes("wind", context.short_name)),
    value: {
      label: "Wind",
      code: "wind",
    },
  },
  {
    condition: () => true,
    value: {
      label: "Miscellaneous",
      code: "misc",
    },
  },
];

const variableType = (contexts) => {
  for (const [order, type] of types.entries()) {
    if (type.condition(contexts)) {
      return {
        ...type.value,
        order,
      };
    }
  }

  // Just in case I'm dumber than I think I am.
  return {
    label: "Programmer Fail",
    type: "fail",
    order: 999,
  };
};

const getOptions = (allVariables) =>
  allVariables === null
    ? []
    : flow(
        tap((allVariables) => console.log("allVariables", allVariables)),
        // Create one option per unique variable display_name.
        map((variable) => ({
          context: variable,
          value: variable.display_name,
        })),
        groupByGeneral(({ value }) => value),
        map((group) => ({
          contexts: map((item) => item.context)(group.items),
          value: group.by,
          label: group.by,
        })),
        sortBy("label"),
        tap((options) => console.log("ungrouped variable options", options)),

        // Group options by variable type: temp, precip, humidity, wind, misc.
        groupByGeneral(({ contexts }) => variableType(contexts)),

        // Create from the grouped options a grouped options object that
        // React Select can consume.
        map((group) => ({
          ...group.by,
          options: group.items,
        })),
        sortBy("order"),

        tap((options) => console.log("grouped variable options", options)),
      )(allVariables);

const VariableSelector = (props) => {
  const {
    allVariables,
    onReady = () => null,
    value,
    onChange,
    defaultValueSelector = "all",
  } = props;
  const options = useMemo(() => getOptions(allVariables), [allVariables]);

  useEffect(() => {
    onChange(defaultValue(defaultValueSelector, flattenOptions(options)));
  }, [allVariables]);

  const onAllClick = () => onChange(flattenOptions(options));
  const onNoneClick = () => onChange([]);
  const onClickGroup = (group) => () => onChange(group.options);

  useEffect(() => {
    const actions = {
      getAllOptions: () => options,
      selectAll: onAllClick,
      selectNone: onNoneClick,
    };
    onReady(actions);
  }, []);

  const { size, variant, className } = selectorButtonProps;

  return (
    <Form>
      <div>
        <Form.Label>Variable</Form.Label>{" "}
        <InfoPopup title={"Variable multiselector"}>
          <ul className={"compact"}>
            <li>At startup, all variables are selected.</li>
            <li>
              Use the None button to clear all variables from the selector.
            </li>
            <li>
              Use the All button to add all available variables to the selector.
            </li>
            <li>
              Use the All <i>Category</i> button to select all (and only)
              variables of a given category to the selector.
            </li>
            <li>
              Click the dropdown and select an item to add a single unselected
              variable.
            </li>
            <li>Click the X next to a selected variable to remove it.</li>
          </ul>
        </InfoPopup>
      </div>
      <ButtonToolbar className={css.selectorButtons}>
        <Button {...{ size, variant, className }} onClick={onAllClick}>
          All
        </Button>
        {map((group) => (
          <Button
            key={group.label}
            {...{ size, variant, className }}
            onClick={onClickGroup(group)}
          >
            {`All ${group.label}`}
          </Button>
        ))(options)}
        <Button {...{ size, variant, className }} onClick={onNoneClick}>
          None
        </Button>
      </ButtonToolbar>
      <Select
        options={options}
        placeholder={
          allVariables ? "Select or type to search..." : "Loading..."
        }
        {...props}
        isMulti
      />
    </Form>
  );
};

VariableSelector.propTypes = {
  allVariables: PropTypes.array,
  onReady: PropTypes.func.isRequired,
  value: PropTypes.array, // can be null
  onChange: PropTypes.func.isRequired,
  defaultValueSelector: LocalPropTypes.defaultValueSelector,
};

export default VariableSelector;
