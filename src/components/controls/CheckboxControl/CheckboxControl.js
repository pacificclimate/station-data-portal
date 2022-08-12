import PropTypes from 'prop-types';
import React from 'react';
import { Form } from 'react-bootstrap';

import './OnlyWithClimatologyControl.css';

export default function CheckboxControl({
  label, value, onChange, ...rest
}) {
  return (
    <Form>
      <Form.Check
        className={"fw-bold"}
        label={label}
        checked={value}
        onChange={onChange}
        {...rest}
      />
    </Form>
  );
}

CheckboxControl.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};
