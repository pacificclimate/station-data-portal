import DownloadStationData from "@/components/controls/DownloadStationData";
import { useStore } from "@/state/client/state-store";
import React from "react";
import { Container, Spinner } from "react-bootstrap";
import { useStation } from "@/state/query-hooks/use-station";
import { useStationVariablesDefaults } from "@/state/client-server-hooks/use-station-variables-defaults";
import HeaderBlock from "./HeaderBlock";
import NavBlock from "./NavBlock";
import GraphsBlock from "./GraphsBlock";

export default function StationPreview({ stationId, onClose }) {
  const readyStationId = useStore((state) => state.stationId);
  // initialize the zustand store with defaults based on data loaded from react query.
  const {
    data: station,
    isLoading: isStationLoading,
    isError: isStationError,
  } = useStation(stationId);
  const {
    data: previewStationVariables,
    isLoading,
    isError,
  } = useStationVariablesDefaults(stationId);

  if (isError || isStationError)
    return (
      <div role="alert">
        Unable to load this station preview. Please try again.
      </div>
    );

  if (isLoading || isStationLoading || readyStationId !== stationId) {
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
      <div className="my-2">
        <DownloadStationData
          scope="station"
          stations={station ? [station] : []}
        />
      </div>
      {!hasVariables && (
        <p>This station has no observation variables to preview.</p>
      )}
      {hasVariables && (
        <>
          <NavBlock onClose={onClose} />
          <GraphsBlock />
        </>
      )}
    </Container>
  );
}

export const Component = StationPreview;
