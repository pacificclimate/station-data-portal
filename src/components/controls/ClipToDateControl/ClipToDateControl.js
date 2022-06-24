import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Form } from 'react-bootstrap';

import './ClipToDateControl.css';

export default class ClipToDateControl extends Component {
  static propTypes = {
    value: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const { value, ...rest } = this.props;
    return (
      <Form>
        <Form.Check
          className={"fw-bold"}
          checked={value}
          label={"Clip time series to filter date range"}
          {...rest}
        />
      </Form>
    );
  }
}

