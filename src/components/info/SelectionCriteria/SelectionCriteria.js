import React from "react";

function SelectionCriteria({ Container = "p" }) {
  return (
    <Container>
      Stations <em>displayed on the map</em> are filtered by the dates of
      available observations, the network they are part of, the variable(s) they
      observe,and the frequency of observation. Stations{" "}
      <em>selected for data and metadata download</em> are further limited by
      the polygon you draw on the map (no polygon: all displayed stations).
    </Container>
  );
}

export default SelectionCriteria;
