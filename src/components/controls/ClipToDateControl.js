import PropTypes from "prop-types";
import React from "react";
import { Form } from "react-bootstrap";

export const ClipToDateControl = ({ value, onChange }) => {
  return (
    <Form>
      <Form.Check
        className={"fw-bold"}
        checked={value}
        label={"Clip time series to filter date range"}
        onChange={(e) => onChange(e.target.checked)}
      />
    </Form>
  );
};

ClipToDateControl.propTypes = {
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ClipToDateControl;
