import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  Button,
  ButtonToolbar,
  ControlLabel,
  FormGroup
} from 'react-bootstrap';
import Select from 'react-select';
import memoize from 'memoize-one';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import filter from 'lodash/fp/filter';
import sortBy from 'lodash/fp/sortBy';
import toPairs from 'lodash/fp/toPairs';
import fromPairs from 'lodash/fp/fromPairs';
import identity from 'lodash/fp/identity';
import assign from 'lodash/fp/assign';
import tap from 'lodash/fp/tap';

import { composeWithRestArgs } from '../../../utils/fp'
import chroma from 'chroma-js';
import logger from '../../../logger';
import { defaultValue } from '../common';
import LocalPropTypes from '../../local-prop-types';

import css from '../common.module.css';

logger.configure({ active: true });


class NetworkSelector extends Component {
  static propTypes = {
    allNetworks: PropTypes.array.isRequired,
    onReady: PropTypes.func.isRequired,
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    defaultValueSelector: LocalPropTypes.defaultValueSelector,
  };

  static defaultProps = {
    onReady: () => null,
    defaultValueSelector: 'all',
  };

  componentDidMount() {
    this.setDefault();
    const actions = {
      getAllOptions: this.getOptions,
      selectAll: this.handleClickAll,
      selectNone: this.handleClickNone,
    };
    this.props.onReady(actions);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.allNetworks !== prevProps.allNetworks) {
      this.setDefault();
    }
  }

  setDefault = () => {
    this.props.onChange(
      defaultValue(this.props.defaultValueSelector, this.getOptions())
    );
  };

  // This function must be an instance property to be memoized correctly.
  makeOptions = memoize(allNetworks => (
    allNetworks === null ?
      [] :
      flow(
        map(
          network => ({
            value: network,
            label: `${network.name}`,
            // label: `${network.name} – ${network.long_name}`,
            isDisabled: !network.publish,
          })
        ),
        sortBy('label'),
      )(allNetworks)
  ));

  static localStyles = {
    option: (styles, { value, isDisabled }) => {
      const color = chroma(value.color || '#000000');
      return {
        ...styles,
        backgroundColor: isDisabled ? null : color.alpha(0.5).css(),
        borderBottom: '1px solid #aaa',
      };
    },
    multiValue: (styles, { data: { value, isDisabled } }) => {
      const color = chroma(value.color || '#000000');
      return {
        ...styles,
        backgroundColor: isDisabled ? null : color.alpha(0.5).css(),
      };
    },
  };

  getOptions = () => this.makeOptions(this.props.allNetworks);

  handleClickAll = () =>
    this.props.onChange(
      filter(option => !option.isDisabled)(this.getOptions())
    );

  handleClickNone = () => this.props.onChange([]);

  render() {
    const { styles } = this.props;
    const composedStyles = assign(
      styles,
      flow(
        toPairs,
        map(([name, style]) => ([
          name, composeWithRestArgs(style, styles[name] || identity)
        ])),
        fromPairs
      )(NetworkSelector.localStyles)
    );

    return (
      <FormGroup>
        <div><ControlLabel>Network</ControlLabel></div>
        <ButtonToolbar className={css.selectorButtons}>
          <Button bsSize={'xsmall'} onClick={this.handleClickAll}>All</Button>
          <Button bsSize={'xsmall'} onClick={this.handleClickNone}>None</Button>
        </ButtonToolbar>
        <Select
          options={this.getOptions()}
          placeholder={
            this.props.allNetworks ? 'Select or type to search...' : 'Loading...'
          }
          {...this.props}
          styles={composedStyles}
          isMulti
        />
      </FormGroup>
    );
  }
}

export default NetworkSelector;
