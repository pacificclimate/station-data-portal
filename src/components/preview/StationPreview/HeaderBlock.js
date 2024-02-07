import React from "react";
import map from "lodash/fp/map";
import { Accordion, Table } from "react-bootstrap";
import { useStore } from "../../../state/state-store";

export const HeaderBlock = () => {
  const { station } = useStore((state) => ({
    station: state.previewStation,
  }));

  if (!station) {
    return null;
  }

  return (
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
      ))(station.histories)}
    </Accordion>
  );
};

export default HeaderBlock;
