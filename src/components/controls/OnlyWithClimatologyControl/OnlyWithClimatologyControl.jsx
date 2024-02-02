import PropTypes from "prop-types";
import React from "react";

import CheckboxControl from "../CheckboxControl/CheckboxControl";
import "./OnlyWithClimatologyControl.css";

export default function OnlyWithClimatologyControl(props) {
  return (
    <CheckboxControl
      label={"Only include stations with climatology"}
      {...props}
    />
  );
}

OnlyWithClimatologyControl.propTypes = {
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};
