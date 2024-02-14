import React from "react";
import { Card, Col, Row } from "react-bootstrap";
import map from "lodash/fp/map";
import PreviewGraph from "./PreviewGraph";
import { useStore } from "../../../state/state-store";
import { useStation } from "../../../state/query-hooks/use-station";
import { useStationVariables } from "../../../state/query-hooks/use-station-variables";

const GraphsBlock = () => {
  const stationId = useStore((state) => state.stationId);
  const showLegend = useStore((state) => state.showLegend);
  const {
    data: previewStation,
    isLoading: isStationLoading,
    isStationisError,
  } = useStation(stationId);
  const {
    data: previewStationVariables,
    isLoading: isVariableLoading,
    isError: isVariableError,
  } = useStationVariables(stationId);
  const selectedStartDate = useStore((state) => state.selectedStartDate);
  const selectedEndDate = useStore((state) => state.selectedEndDate);

  const graphWidth = showLegend ? 8 : 12;
  const legendWidth = showLegend ? 4 : 0;

  if (isStationLoading || isVariableLoading) {
    return (
      <Row>
        <Col xs={12} className="d-flex justify-content-center">
          <Card>
            <Card.Body>
              <Card.Title>Loading...</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  if (isStationisError || isVariableError) {
    return (
      <Row>
        <Col xs={12} className="d-flex justify-content-center">
          <Card>
            <Card.Body>
              <Card.Title>Error loading station variable data.</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  if (!(previewStationVariables.variables?.length ?? 0 > 0)) {
    return (
      <Row>
        <Col xs={12} className="d-flex justify-content-center">
          <Card>
            <Card.Body>
              <Card.Title>No Variables available for this station.</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <>
      {map((variable) => (
        <Row key={`${previewStation.id}-${variable.id}`} className="mb-1">
          <Col xs={graphWidth} className="d-flex justify-content-center">
            {selectedStartDate && selectedEndDate && (
              <PreviewGraph variableId={variable.id} />
            )}
          </Col>
          {showLegend && (
            <Col xs={legendWidth} className="d-flex">
              <Card style={{ width: "100%" }}>
                <Card.Body>
                  <Card.Title>{variable.display_name}</Card.Title>
                  <Card.Body>{variable.description}</Card.Body>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      ))(previewStationVariables.variables)}
    </>
  );
};

export default GraphsBlock;
