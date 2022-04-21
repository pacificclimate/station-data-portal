import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { FormGroup } from 'react-bootstrap';

import './OnlyWithClimatologyControl.css';
import { Checkbox } from 'react-bootstrap';

export default class OnlyWithClimatologyControl extends Component {
  static propTypes = {
    value: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const { value, ...rest } = this.props;
    return (
      <FormGroup>
        <Checkbox checked={value} {...rest}>
          Only include stations with climatology
        </Checkbox>
      </FormGroup>
    );
  }
}

