import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { FormGroup, Radio } from 'react-bootstrap';

import logger from '../../../logger';


logger.configure({ active: true });


export default class BaseMapSelector extends Component {
  static propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
  };

  static defaultProps = {
    name: "baseMap",
  }

  static options = [
    {
      label: 'Yukon Albers',
      value: 'YNWT',
    },
    {
      label: 'BC Albers',
      value: 'BC',
    },
  ];

  render() {
    return (
      <FormGroup>
        {
          BaseMapSelector.options.map(({label, value}) => (
            <Radio
              name={BaseMapSelector.name}
              checked={value === this.props.value}
              onClick={() => this.props.onChange(value)}
            >
              {label}
            </Radio>
          ))
        }
      </FormGroup>
    );
  }
}
