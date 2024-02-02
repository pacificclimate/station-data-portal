import PropTypes from "prop-types";
import React from "react";

import InfoPopup from "../../util/InfoPopup/InfoPopup";
import CheckboxControl from "../CheckboxControl/CheckboxControl";
import "./IncludeStationsWithNoObsControl.css";

export default function IncludeStationsWithNoObsControl(props) {
  const label = "Include stations with no observations";
  return (
    <CheckboxControl
      label={label}
      {...props}
      extra={
        <InfoPopup title={label}>
          <p>
            This control affects filtering on Date, Variable, and Observation
            Frequency.
          </p>
          <p>
            If this control is checked, then stations with no observations are
            selected regardless of the settings of those filters.
          </p>
          <p>
            If this control is not checked, filtering is applied as usual with
            those filters, with the result that stations with no observations
            are not selected.
          </p>
          <p>
            To see only stations with no observations, check this control and
            set Variable or Frequency filtering to none.
          </p>
        </InfoPopup>
      }
    />
  );
}

IncludeStationsWithNoObsControl.propTypes = {
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};
