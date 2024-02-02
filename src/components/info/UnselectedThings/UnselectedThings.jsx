import PropTypes from "prop-types";
import React from "react";

import "./UnselectedThings.css";
import flow from "lodash/fp/flow";
import filter from "lodash/fp/filter";
import map from "lodash/fp/map";
import join from "lodash/fp/join";

function UnselectedThings({
  selectedNetworksOptions,
  selectedVariablesOptions,
  selectedFrequenciesOptions,
}) {
  const selections = [
    {
      name: "networks",
      items: selectedNetworksOptions,
    },
    {
      name: "variables",
      items: selectedVariablesOptions,
    },
    {
      name: "frequencies",
      items: selectedFrequenciesOptions,
    },
  ];

  const unselectedThings = flow(
    filter((thing) => (thing.items?.length ?? 0) === 0),
    map((thing) => thing.name),
    join(", or "),
  )(selections);

  return (
    unselectedThings && <p>You haven't selected any {unselectedThings}.</p>
  );
}

UnselectedThings.propTypes = {};

export default UnselectedThings;
