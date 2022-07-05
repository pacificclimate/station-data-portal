import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import './Disclaimer.css';
import { config } from '../../../utils/configuration';




function Disclaimer() {
  const [acknowledged, setAcknowledged] = useState(!config.disclaimerEnabled);
  const acknowledge = () => setAcknowledged(true);

  return (
    <Modal
      backdrop={"static"}
      show={!acknowledged}
      onHide={acknowledge}
      style={{ zIndex: 2000 }}
    >
      <Modal.Header>
        <Modal.Title>{config.disclaimerTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{config.disclaimerBody}</Modal.Body>
      <Modal.Footer>
        <Button bsStyle={"primary"} onClick={acknowledge}>
          {config.disclaimerButtonLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Disclaimer;
