import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  Button,
  ButtonToolbar,
  Form,
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

import { composeWithRestArgs } from '../../../utils/fp'
import chroma from 'chroma-js';
import logger from '../../../logger';
import { defaultValue } from '../common';
import LocalPropTypes from '../../local-prop-types';
import InfoPopup from '../../util/InfoPopup';

import css from '../common.module.css';

logger.configure({ active: true });


class NetworkSelector extends Component {
  static propTypes = {
    allNetworks: PropTypes.array,
    onReady: PropTypes.func.isRequired,
    value: PropTypes.array,  // can be null
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
      <Form>
        <div>
          <Form.Label>Network</Form.Label>
          {' '}
          <InfoPopup title={"Network multiselector"}>
            <ul className={"compact"}>
              <li>At startup, all networks are selected.</li>
              <li>Use the None button to clear all networks from the selector.</li>
              <li>Use the All button to add all available networks to the selector.</li>
              <li>Click the dropdown and select an item to add a single
                unselected network.</li>
              <li>Click the X next to a selected network to remove it.</li>
            </ul>
          </InfoPopup>
        </div>
        <ButtonToolbar className={css.selectorButtons}>
          <Button size={'sm'} onClick={this.handleClickAll}>All</Button>
          <Button size={'sm'} onClick={this.handleClickNone}>None</Button>
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
      </Form>
    );
  }
}

export default NetworkSelector;
