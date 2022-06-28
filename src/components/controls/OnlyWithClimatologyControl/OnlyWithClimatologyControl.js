import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Form } from 'react-bootstrap';

import './OnlyWithClimatologyControl.css';

export default class OnlyWithClimatologyControl extends Component {
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
          label={"Only include stations with climatology"}
          checked={value}
          {...rest}
        />
      </Form>
    );
  }
}

