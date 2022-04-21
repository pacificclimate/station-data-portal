import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Checkbox, FormGroup } from 'react-bootstrap';

import './ClipToDateControl.css';

export default class ClipToDateControl extends Component {
  static propTypes = {
    value: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const { value, ...rest } = this.props;
    return (
      <FormGroup>
        <Checkbox checked={value} {...rest}>
          Clip time series to filter date range
        </Checkbox>
      </FormGroup>
    );
  }
}

