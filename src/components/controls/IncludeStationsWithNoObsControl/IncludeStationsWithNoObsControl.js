import PropTypes from 'prop-types';
import React from 'react';

import CheckboxControl from "../CheckboxControl";
import './IncludeStationsWithNoObsControl.css';

export default function IncludeStationsWithNoObsControl(props) {
  return (
    <CheckboxControl
      label={"Include stations with no observations"}
      {...props}
    />
  )
}

IncludeStationsWithNoObsControl.propTypes = {
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};
