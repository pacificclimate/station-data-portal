import React from "react";
import { Card, Col, Row } from "react-bootstrap";
import map from "lodash/fp/map";
import PreviewGraph from "./PreviewGraph";

const GraphsBlock = ({ stationPreview }) => {
  return (
    <>
      {map((resp) => {
        console.log(resp.variable);
        return (
          <Row key={`${resp.station.id}-${resp.variable.id}`} className="mb-1">
            <Col xs={8}>
              <PreviewGraph plotData={resp} />
            </Col>
            <Col xs={4} className="d-flex">
              <Card style={{ width: "100%" }}>
                <Card.Body>
                  <Card.Title>{resp.variable.name}</Card.Title>
                  <Card.Body>{resp.variable.description}</Card.Body>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        );
      })(stationPreview)}
    </>
  );
};

export default GraphsBlock;
