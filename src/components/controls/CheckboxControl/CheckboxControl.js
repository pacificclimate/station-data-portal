import PropTypes from "prop-types";
import React from "react";
import { Form } from "react-bootstrap";

import "./CheckboxControl.css";

export default function CheckboxControl({
  label,
  value,
  onChange,
  extra,
  ...rest
}) {
  return (
    <Form className={"CheckboxControl"}>
      <Form.Check
        className={"fw-bold"}
        label={label}
        checked={value}
        onChange={onChange}
        {...rest}
      />{" "}
      {extra}
    </Form>
  );
}

CheckboxControl.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  extra: PropTypes.any,
};
