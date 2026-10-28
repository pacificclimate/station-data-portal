import React from "react";
import { Modal } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import StationPreview from "./StationPreview";

export function Component() {
  const { stationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const close = () => {
    if (location.state?.previewFrom?.pathname === "/") navigate(-1);
    else
      navigate({ pathname: "/", search: location.search }, { replace: true });
  };
  return (
    <Modal
      show
      onHide={close}
      size="xl"
      scrollable
      aria-labelledby="station-preview-title"
    >
      <Modal.Header closeButton>
        <Modal.Title id="station-preview-title">Variable preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <StationPreview key={stationId} stationId={stationId} onClose={close} />
      </Modal.Body>
    </Modal>
  );
}
export default Component;
