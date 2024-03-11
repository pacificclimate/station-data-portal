import { useLoaderData } from "react-router-dom";
import React from "react";
import { Container, Spinner } from "react-bootstrap";
import { useStation } from "@/state/query-hooks/use-station";
import { useStationVariablesDefaults } from "@/state/client-server-hooks/use-station-variables-defaults";
import HeaderBlock from "./HeaderBlock";
import NavBlock from "./NavBlock";
import GraphsBlock from "./GraphsBlock";

export default function StationPreview() {
  const urlParams = useLoaderData();
  // initialize the zustand store with defaults based on data loaded from react query.
  const { isLoading: isStationLoading } = useStation(urlParams.stationId);
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

export const Component = StationPreview;
