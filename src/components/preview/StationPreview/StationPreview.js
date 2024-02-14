import { useLoaderData, Link } from "react-router-dom";
import React, { useEffect } from "react";
import { Container, Spinner, Row, Col } from "react-bootstrap";
import HeaderBlock from "./HeaderBlock";
import NavBlock from "./NavBlock";
import GraphsBlock from "./GraphsBlock";
import { useStation } from "../../../state/query-hooks/use-station";
import { useStationVariablesDefaults } from "../../../state/client-server-hooks/use-station-variables-defaults";

export default function StationPreview() {
  const urlParams = useLoaderData();
  // initialize the zustand store with defaults based on data loaded from react query.
  const {
    data: previewStation,
    isLoading: isStationLoading,
    isError: isStationError,
  } = useStation(urlParams.stationId);
  const { data: previewStationVariables, isLoading } =
    useStationVariablesDefaults(urlParams.stationId);

  if (isLoading || isStationLoading) {
    return (
      <Container fluid className="StationPreview">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  const hasVariables = (previewStationVariables?.variables?.length ?? 0) > 0;

  return (
    <Container className="StationPreview mt-2">
      <HeaderBlock />
      {hasVariables && (
        <>
          <NavBlock />
          <GraphsBlock />
        </>
      )}
    </Container>
  );
}

// returns the id of the selected station from the URL
// the results of this function are accessed via "useLoaderData"
// and it is configured via the router in index.js.
export const loader = async ({ params }) => {
  // TODO: Make int?
  const stationId = params.stationId;
  return { stationId };
};

export const Component = StationPreview;
