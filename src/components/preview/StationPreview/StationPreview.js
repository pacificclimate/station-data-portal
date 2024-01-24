import { Link, useLoaderData } from "react-router-dom";
import React, { useEffect } from "react";
import { Container } from "react-bootstrap";
import { useStore } from "../../../state/state-store";
import map from "lodash/fp/map";
import PreviewGraph from "../PreviewGraph";
import { Col, Row } from "react-bootstrap";

export default function StationPreview() {
  const urlParams = useLoaderData();
  const station = useStore((state) =>
    state.getStationById(urlParams.stationId),
  );
  const loadStationPreview = useStore((state) => state.loadStationPreview);
  const stationPreview = useStore((state) => state.stationPreview);
  const isConfigLoaded = useStore((state) => state.isConfigLoaded);
  const isMetaLoaded = useStore(
    (state) => !state.loadingMeta && state.stations !== null,
  );
  const config = useStore((state) => state.config);

  useEffect(() => {
    if (isConfigLoaded() && isMetaLoaded) {
      loadStationPreview(urlParams.stationId);
    }
  }, [config, station]);

  if (!station) {
    return (
      <Container fluid className="StationPreview">
        <div>Loading...</div>
      </Container>
    );
  }

  console.log("### station preview", stationPreview);
  return (
    <Container fluid className="StationPreview">
      <Link to={"/"}>Back to main</Link>
      {map((resp) => (
        <Row>
          <Col xs={12}>
            <PreviewGraph
              plotData={resp}
              key={`${resp.station.id}-${resp.variable.id}`}
            />
          </Col>
        </Row>
      ))(stationPreview)}
    </Container>
  );
}

// returns the id of the selected station from the URL
// the results of this function are accessed via "useLoaderData"
// and it is configured via the router in index.js.
export function loader({ params }) {
  // TODO: Make int?
  const stationId = params.stationId;
  return { stationId };
}
