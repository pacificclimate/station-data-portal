import React from "react";

import flow from "lodash/fp/flow";
import filter from "lodash/fp/filter";
import map from "lodash/fp/map";
import join from "lodash/fp/join";

function UnselectedThings({
  selectedNetworks,
  selectedVariables,
  selectedFrequencies,
}) {
  const selections = [
    {
      name: "networks",
      items: selectedNetworks,
    },
    {
      name: "variables",
      items: selectedVariables,
    },
    {
      name: "frequencies",
      items: selectedFrequencies,
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
