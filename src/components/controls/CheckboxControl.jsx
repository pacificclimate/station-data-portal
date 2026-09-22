import PropTypes from "prop-types";
import React from "react";
import { Form } from "react-bootstrap";

import css from "./CheckboxControl.module.css";

export const CheckboxControl = ({ label, value, onChange, children }) => {
  return (
    <Form>
      <Form.Check
        className={["fw-bold", css.checkBoxCheck]}
        label={label}
        checked={value}
        onChange={onChange}
      />{" "}
      {children}
    </Form>
  );
};

CheckboxControl.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default CheckboxControl;
