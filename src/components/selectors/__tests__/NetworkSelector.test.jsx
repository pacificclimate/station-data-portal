import React from "react";
import { createRoot } from "react-dom/client";
import NetworkSelector from "../NetworkSelector";
import noop from "lodash/noop";

// TODO: Put this elsewhere
const allNetworks = [
  {
    color: "#ff0000",
    id: 2,
    long_name: "Environment and Climate Change Canada",
    name: "ECCC",
    publish: true,
    uri: "/networks/2",
    virtual: null,
  },
  {
    color: "#3fbd46",
    id: 8,
    long_name: "Yukon Parks",
    name: "YP",
    publish: true,
    uri: "/networks/8",
    virtual: null,
  },
  {
    color: "#30e4dd",
    id: 10,
    long_name: "Yukon Water Resources",
    name: "YWR",
    publish: true,
    uri: "/networks/10",
    virtual: null,
  },
  {
    color: "#cd7638",
    id: 11,
    long_name: "Yukon Wildland Fire Management",
    name: "YWFM",
    publish: true,
    uri: "/networks/11",
    virtual: null,
  },
  {
    color: "#d755b3",
    id: 15,
    long_name: "Private industry data providers",
    name: "pvt_industry",
    publish: true,
    uri: "/networks/15",
    virtual: null,
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
    <NetworkSelector
      allNetworks={allNetworks}
      onReady={noop}
      onChange={noop}
      value={[]}
      styles={commonSelectorStyles}
    />,
  );
});
