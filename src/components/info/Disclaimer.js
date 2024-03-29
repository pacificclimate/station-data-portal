import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useConfigContext } from "@/state/context-hooks/use-config-context";

function Disclaimer() {
  const config = useConfigContext();
  const [acknowledged, setAcknowledged] = useState(!config.disclaimer.enabled);
  const acknowledge = () => setAcknowledged(true);

  return (
    <Modal
      backdrop={"static"}
      show={!acknowledged}
      onHide={acknowledge}
      style={{ zIndex: 2000 }}
    >
      <Modal.Header>
        <Modal.Title>{config.disclaimer.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{config.disclaimer.body}</Modal.Body>
      <Modal.Footer>
        <Button bsStyle={"primary"} onClick={acknowledge}>
          {config.disclaimer.buttonLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Disclaimer;
