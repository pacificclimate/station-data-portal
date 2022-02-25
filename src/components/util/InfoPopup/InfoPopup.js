import React from 'react';

import './InfoPopup.css';
import { Glyphicon, OverlayTrigger, Popover } from 'react-bootstrap';


function InfoPopup({
  placement = "right",
  glyph= 'info-sign',
  title,
  children
}) {
  return (
    <OverlayTrigger
      overlay={
        <Popover
          placement={placement}
          title={title}
        >
          {children}
        </Popover>}
    >
      <Glyphicon glyph={glyph}/>
    </OverlayTrigger>
  );
}

InfoPopup.propTypes = {
};

export default InfoPopup;
