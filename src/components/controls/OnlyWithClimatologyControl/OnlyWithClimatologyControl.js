import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './OnlyWithClimatologyControl.css';
import { Checkbox, ControlLabel } from 'react-bootstrap';

export default class OnlyWithClimatologyControl extends Component {
  static propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const { value, ...rest } = this.props;
    return (
      <Checkbox checked={value} {...rest}>
        <ControlLabel>Only include stations with climatology</ControlLabel>
      </Checkbox>
    );
  }
}

