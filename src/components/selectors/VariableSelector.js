import React, { useMemo } from "react";
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
import uniq from "lodash/fp/uniq";
import { groupByGeneral } from "@/utils/fp/fp";
import { selectorButtonProps } from "./common";
import logger from "@/logger";
import { useVariables } from "@/state/query-hooks/use-variables";
import { useStationsStore } from "@/state/client/stations-store";
import InfoPopup from "@/components/util/InfoPopup";
import LocalPropTypes from "@/components/local-prop-types";
import { commonSelectorStyles } from "@/components/selectors/commonSelectorStyles";

import css from "./common.module.css";

logger.configure({ active: true });

// TODO: Update pcic-react-components GroupingSelector to communicate options
// and reuse here? Right now there is a lot of repetition of function.

export const flattenOptions = flow(
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
export const variableIdsFromOptions = flow(
  map((selectedVariable) => selectedVariable.contexts),
  flatten,
  map((context) => context.id),
  uniq,
);

export const getOptions = (allVariables) =>
  allVariables === null
    ? []
    : flow(
        //tap((allVariables) => console.log("allVariables", allVariables)),
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
        //tap((options) => console.log("ungrouped variable options", options)),

        // Group options by variable type: temp, precip, humidity, wind, misc.
        groupByGeneral(({ contexts }) => variableType(contexts)),

        // Create from the grouped options a grouped options object that
        // React Select can consume.
        map((group) => ({
          ...group.by,
          options: group.items,
        })),
        sortBy("order"),

        //tap((options) => console.log("grouped variable options", options)),
      )(allVariables);

const VariableSelector = () => {
  const { data: variables } = useVariables();
  const options = useMemo(() => getOptions(variables), [variables]);
  const { selectedVariables, setSelectedVariables } = useStationsStore(
    (state) => ({
      selectedVariables: state.selectedVariables,
      setSelectedVariables: state.setSelectedVariables,
    }),
  );

  const { size, variant, className } = selectorButtonProps;

  const onChange = (selected) => {
    console.log(selected);
    setSelectedVariables(variableIdsFromOptions(selected));
  };

  const value = useMemo(() => {
    if (variables) {
      return flattenOptions(
        getOptions(
          variables.filter((variable) =>
            selectedVariables.includes(variable.id),
          ),
        ),
      );
    } else return [];
  }, [variables, selectedVariables]);

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
        <Button
          {...{ size, variant, className }}
          onClick={() => onChange(flattenOptions(options))}
        >
          All
        </Button>
        {map((group) => (
          <Button
            key={group.label}
            {...{ size, variant, className }}
            onClick={() => onChange(group.options)}
          >
            {`All ${group.label}`}
          </Button>
        ))(options)}
        <Button {...{ size, variant, className }} onClick={() => onChange([])}>
          None
        </Button>
      </ButtonToolbar>
      <Select
        options={options}
        placeholder={variables ? "Select or type to search..." : "Loading..."}
        isMulti
        {...{ value, onChange }}
        isSearchable
        isClearable={false}
        styles={commonSelectorStyles}
      />
    </Form>
  );
};

VariableSelector.propTypes = {
  defaultValueSelector: LocalPropTypes.defaultValueSelector,
};

export default VariableSelector;
