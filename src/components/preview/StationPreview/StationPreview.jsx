import { useLoaderData } from "react-router-dom";
import React, { useEffect } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../../../state/state-store";
import NavBlock from "./NavBlock";
import GraphsBlock from "./GraphsBlock";

export default function StationPreview() {
  const urlParams = useLoaderData();
  const data = useStore(
    useShallow((state) => ({
      station: state.previewStation,
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
  }, [data.isConfigLoaded, urlParams.stationId]);

  // once station is loaded we need to load our preview information
  useEffect(() => {
    if (actions.isConfigLoaded() && data.station) {
      actions.loadPreviewStationVariables(data.station.id);
    }
  }, [data.config, data.station]);

  if (!data.station) {
    return (
      <Container fluid className="StationPreview">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  console.log("### station preview", data.previewVariables);
  return (
    <Container className="StationPreview">
      <NavBlock />
      <GraphsBlock stationPreview={data.previewVariables} />
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
