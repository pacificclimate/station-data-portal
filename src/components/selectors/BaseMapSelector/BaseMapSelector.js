import PropTypes from 'prop-types';
import React, { Component } from 'react';

import logger from '../../../logger';

import { FormGroup, Radio } from 'react-bootstrap';
import { BCBaseMap, YNWTBaseMap } from 'pcic-react-leaflet-components';

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
      value: YNWTBaseMap,
    },
    {
      label: 'BC Albers',
      value: BCBaseMap,
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
