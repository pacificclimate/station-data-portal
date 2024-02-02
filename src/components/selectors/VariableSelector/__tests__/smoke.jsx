import React from "react";
import { createRoot } from "react-dom/client";
import VariableSelector from "../VariableSelector";
import noop from "lodash/noop";

// TODO: Put this elsewhere
const allVariables = [
  {
    cell_method: "time: mean",
    display_name: "Air Temperature",
    id: 16,
    name: "Temperature",
    network_uri: "/networks/11",
    precision: null,
    short_name: null,
    standard_name: "air_temperature",
    unit: "Celsius",
    uri: "/variables/16",
  },
  {
    cell_method: "time: point",
    display_name: "Relative Humidity",
    id: 17,
    name: "RH",
    network_uri: "/networks/11",
    precision: null,
    short_name: null,
    standard_name: "relative_humidity",
    unit: "%\n",
    uri: "/variables/17",
  },
  {
    cell_method: "time: point",
    display_name: "Wind Speed",
    id: 18,
    name: "Wspd",
    network_uri: "/networks/11",
    precision: null,
    short_name: null,
    standard_name: "wind_speed",
    unit: "km h-1",
    uri: "/variables/18",
  },
];

// TODO: Put this elsewhere
const commonSelectorStyles = {
  menu: (provided) => {
    return {
      ...provided,
      zIndex: 999,
    };
  },
  valueContainer: (provided, state) => ({
    ...provided,
    maxHeight: "10em",
    overflowY: "auto",
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    width: "2em",
  }),
  option: (styles) => {
    return {
      ...styles,
      padding: "0.5em",
      fontSize: "0.9em",
    };
  },
};

it("renders without crashing", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  root.render(
    <VariableSelector
      allVariables={allVariables}
      onReady={noop}
      onChange={noop}
      value={[]}
      styles={commonSelectorStyles}
    />,
  );
});
