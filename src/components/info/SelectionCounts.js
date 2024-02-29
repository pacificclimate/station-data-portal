import PropTypes from "prop-types";
import React from "react";
import flow from "lodash/fp/flow";
import map from "lodash/fp/map";
import flatten from "lodash/fp/flatten";
import sum from "lodash/fp/sum";

import logger from "@/logger";

import { useStationsStore } from "@/state/client/stations-store";

logger.configure({ active: true });

const numHistories = flow(
  map((station) => station.histories.length),
  flatten,
  sum,
);

const SelectionCounts = ({ Container = "p" }) => {
  const { stations, selectedStations } = useStationsStore((state) => ({
    stations: state.stations,
    selectedStations: state.selectedStations,
  }));
  if (!stations) {
    return <Container>Loading station info ...</Container>;
  }
  if (!selectedStations) {
    return <Container>Loading selection info ...</Container>;
  }
  const numAllHistories = numHistories(stations);
  const numSelectedHistories = numHistories(selectedStations);
  return (
    <Container>
      <b>{selectedStations.length}</b> stations selected of{" "}
      <b>{stations.length}</b> available; {numSelectedHistories} histories of{" "}
      {numAllHistories}
    </Container>
  );
};

SelectionCounts.propTypes = {
  allStations: PropTypes.array,
  selectedStations: PropTypes.array,
};

export default SelectionCounts;
