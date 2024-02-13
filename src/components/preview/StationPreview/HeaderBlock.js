import React from "react";
import map from "lodash/fp/map";
import { Accordion, Table, Row, Col, Spinner } from "react-bootstrap";
import { useStore } from "../../../state/state-store";

export const HeaderBlock = () => {
  const { previewStation } = useStore((state) => ({
    previewStation: state.previewStation,
  }));

  if (!previewStation) {
    return (
      <Row>
        <Col xs={12} className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Col>
      </Row>
    );
  }

  return (
    <Row>
      <Col xs={12}>
        <Accordion>
          {map((history) => (
            <React.Fragment key={history.id}>
              <Accordion.Header>
                <h3>
                  {history.station_name}:{" "}
                  {history?.min_obs_time?.toISOString().split("T")[0]} to{" "}
                  {history?.max_obs_time?.toISOString().split("T")[0]}
                </h3>
              </Accordion.Header>
              <Accordion.Body>
                <Table striped bordered hover>
                  <tbody>
                    <tr>
                      <td>Lat: </td>
                      <td>{history.lat}</td>
                    </tr>
                    <tr>
                      <td>Long: </td>
                      <td>{history.lon}</td>
                    </tr>
                    <tr>
                      <td>Elevation:</td>
                      <td>{history.elevation}</td>
                    </tr>
                    <tr>
                      <td>Province: </td>
                      <td>{history.province}</td>
                    </tr>
                  </tbody>
                </Table>
              </Accordion.Body>
            </React.Fragment>
          ))(previewStation.histories)}
        </Accordion>
      </Col>
    </Row>
  );
};

export default HeaderBlock;
