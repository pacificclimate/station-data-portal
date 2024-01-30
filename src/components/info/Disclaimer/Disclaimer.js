"use client";
import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "./Disclaimer.css";

function Disclaimer({ disclaimer }) {
  const [acknowledged, setAcknowledged] = useState(!disclaimer.enabled);
  const acknowledge = () => setAcknowledged(true);

  return (
    <Modal
      backdrop={"static"}
      show={!acknowledged}
      onHide={acknowledge}
      style={{ zIndex: 2000 }}
    >
      <Modal.Header>
        <Modal.Title>{disclaimer.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{disclaimer.body}</Modal.Body>
      <Modal.Footer>
        <Button bsStyle={"primary"} onClick={acknowledge}>
          {disclaimer.buttonLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Disclaimer;
