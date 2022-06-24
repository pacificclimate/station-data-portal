import React from 'react';

import './InfoPopup.css';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { InfoCircleFill } from 'react-bootstrap-icons';


function InfoPopup({
  placement = "right",
  title,
  children,
}) {
  return (
    <OverlayTrigger
      overlay={
        <Popover
          id={title}
          placement={placement}
          title={title}
        >
          {children}
        </Popover>}
    >
      <InfoCircleFill/>
    </OverlayTrigger>
  );
}

InfoPopup.propTypes = {
};

export default InfoPopup;
