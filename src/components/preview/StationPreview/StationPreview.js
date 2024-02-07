import { useLoaderData } from "react-router-dom";
import React, { useEffect } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../../../state/state-store";
import HeaderBlock from "./HeaderBlock";
import NavBlock from "./NavBlock";
import GraphsBlock from "./GraphsBlock";

export default function StationPreview() {
  const urlParams = useLoaderData();
  const data = useStore(
    useShallow((state) => ({
      previewStation: state.previewStation,
      previewVariables: state.previewStationVariables,
      config: state.config,
    })),
  );
  const actions = useStore((state) => ({
    isConfigLoaded: state.isConfigLoaded,
    loadPreviewStation: state.loadPreviewStation,
    loadPreviewStationVariables: state.loadPreviewStationVariables,
  }));

  // load station we want to do a preview for, this may be instant if the stations are
  // already loaded into the metadata. If missing it will ask the server
  useEffect(() => {
    if (actions.isConfigLoaded()) {
      actions.loadPreviewStation(urlParams.stationId);
    }
  }, [data.config, urlParams.stationId]);

  // once station is loaded we need to load our preview information
  useEffect(() => {
    if (actions.isConfigLoaded() && data.previewStation) {
      actions.loadPreviewStationVariables(data.previewStation.id);
    }
  }, [data.config, data.previewStation]);

  if (!data.previewStation) {
    return (
      <Container fluid className="StationPreview">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="StationPreview mt-2">
      <HeaderBlock />
      <NavBlock />
      <GraphsBlock />
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
