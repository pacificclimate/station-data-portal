import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import './Disclaimer.css';
import { configBool, configString } from '../../../utils/configuration';


const disclaimerEnabled = configBool("DISCLAIMER_ENABLED")
const disclaimerTitle = configString("DISCLAIMER_TITLE", "Disclaimer Title")
const disclaimerBody = configString("DISCLAIMER_BODY", "Disclaimer body ...")
const disclaimerButtonLabel =
  configString("DISCLAIMER_BUTTON_LABEL", "Acknowledge")


function Disclaimer() {
  const [acknowledged, setAcknowledged] = useState(!disclaimerEnabled);
  const acknowledge = () => setAcknowledged(true);

  return (
    <Modal
      backdrop={"static"}
      show={!acknowledged}
      onHide={acknowledge}
      style={{ zIndex: 2000 }}
    >
      <Modal.Header>
        <Modal.Title>{disclaimerTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{disclaimerBody}</Modal.Body>
      <Modal.Footer>
        <Button bsStyle={"primary"} onClick={acknowledge}>
          {disclaimerButtonLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Disclaimer;
