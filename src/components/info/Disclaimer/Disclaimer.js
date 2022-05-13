import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import './Disclaimer.css';


function Disclaimer() {
  const [acknowledged, setAcknowledged] = useState(false);
  const acknowledge = () => setAcknowledged(true);

  return (
    <Modal
      backdrop={"static"}
      show={!acknowledged}
      onHide={acknowledge}
    >
      <Modal.Header>
        <Modal.Title>
          Disclaimer Title
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>Disclaimer body</Modal.Body>
      <Modal.Footer>
        <Button bsStyle={"primary"} onClick={acknowledge}>Acknowledge</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Disclaimer;
