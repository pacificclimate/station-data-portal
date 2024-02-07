import React from "react";
import { Card, Col, Row } from "react-bootstrap";
import map from "lodash/fp/map";
import PreviewGraph from "./PreviewGraph";
import { useStore } from "../../../state/state-store";

const GraphsBlock = () => {
  var { previewStation, previewStationVariables, showLegend } = useStore(
    (state) => ({
      previewStation: state.previewStation,
      previewStationVariables: state.previewStationVariables,
      showLegend: state.showLegend,
    }),
  );

  const graphWidth = showLegend ? 8 : 12;
  const legendWidth = showLegend ? 4 : 0;

  return (
    <>
      {map((variable) => {
        return (
          <Row key={`${previewStation.id}-${variable.id}`} className="mb-1">
            <Col xs={graphWidth}>
              <PreviewGraph variableId={variable.id} />
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
        );
      })(previewStationVariables)}
    </>
  );
};

export default GraphsBlock;
