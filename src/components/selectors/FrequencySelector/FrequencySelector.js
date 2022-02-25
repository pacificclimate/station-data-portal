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
import find from 'lodash/fp/find';
import { defaultValue } from '../common';
import logger from '../../../logger';
import LocalPropTypes from '../../local-prop-types';
import capitalize from 'lodash/fp/capitalize';
import flatten from 'lodash/fp/flatten';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import map from 'lodash/fp/map';
import tap from 'lodash/fp/tap';
import sortBy from 'lodash/fp/sortBy';
import uniqBy from 'lodash/fp/uniqBy';
import InfoPopup from '../../util/InfoPopup';

import css from '../common.module.css';

logger.configure({ active: true });


class FrequencySelector extends Component {
  static propTypes = {
    allStations: PropTypes.array.isRequired,
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
    if (this.props.allStations !== prevProps.allStations) {
      this.setDefault();
    }
  }

  setDefault = () => {
    this.props.onChange(
      defaultValue(this.props.defaultValueSelector, this.getOptions())
    );
  };

  static valueToLabel = freq => {
    const labels = {
      '1-hourly': 'Hourly',
      '12-hourly': 'Semi-daily'
    };
    return get(freq, labels) || capitalize(freq) || 'Unspecified';
  };

  makeOptions = memoize(allStations => (
    allStations === null ?
      [] :
      flow(
        map('histories'),
        flatten,
        uniqBy('freq'),
        map(history => ({
          value: history.freq,
          label: FrequencySelector.valueToLabel(history.freq),
        })),
        sortBy('label'),
      )(allStations)
  ));

  getOptions = () => this.makeOptions(this.props.allStations);

  handleClickAll = () => this.props.onChange(this.getOptions());

  handleClickNone = () => this.props.onChange([]);

  render() {
    return (
      <FormGroup>
        <div>
          <ControlLabel>Observation Frequency</ControlLabel>
          {' '}
          <InfoPopup title={"Observation Frequency multiselector"}>
            <ul className={"compact"}>
              <li>At startup, all frequencies are selected.</li>
              <li>Use the None button to clear all frequencies from the selector.</li>
              <li>Use the All button to add all available frequencies to the selector.</li>
              <li>Click the dropdown and select an item to add a single
                unselected frequency.</li>
              <li>Click the X next to a selected frequency to remove it.</li>
            </ul>
          </InfoPopup>
        </div>
        <ButtonToolbar className={css.selectorButtons}>
          <Button bsSize={'xsmall'} onClick={this.handleClickAll}>All</Button>
          <Button bsSize={'xsmall'} onClick={this.handleClickNone}>None</Button>
        </ButtonToolbar>
        <Select
          options={this.getOptions()}
          placeholder={
            this.props.allStations ? 'Select or type to search...' : 'Loading...'
          }
          {...this.props}
          isMulti
        />
      </FormGroup>
    );
  }
}

export default FrequencySelector;
