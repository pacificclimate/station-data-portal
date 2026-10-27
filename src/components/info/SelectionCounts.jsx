import React from "react";
import flow from "lodash/fp/flow";
import map from "lodash/fp/map";
import flatten from "lodash/fp/flatten";
import sum from "lodash/fp/sum";

import logger from "@/logger";
import { useStations } from "@/state/query-hooks/use-stations";
import { useStationFilteringContext } from "@/state/context-hooks/use-station-filtering-context";

logger.configure({ active: true });

const numHistories = flow(
  map((station) => station.histories.length),
  flatten,
  sum,
);

const SelectionCounts = ({ Container = "p" }) => {
  const { data: stations } = useStations();
  const { selectedStations } = useStationFilteringContext();
  if (!stations) {
    return <Container>Loading station info ...</Container>;
  }
  if (!selectedStations) {
    return <Container>Loading matching station info ...</Container>;
  }
  const numSelectedHistories = numHistories(selectedStations);
  return (
    <Container aria-label="Matching stations">
      <b>{selectedStations.length.toLocaleString()}</b> of{" "}
      <b>{stations.length.toLocaleString()}</b> stations match (
      {numSelectedHistories.toLocaleString()} histories)
    </Container>
  );
};
export default SelectionCounts;
