import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import {
  Button,
  ButtonToolbar,
  ControlLabel,
  FormGroup
} from 'react-bootstrap';
import Select from 'react-select';
import memoize from 'memoize-one';
import { defaultValue } from '../common';
import logger from '../../../logger';
import LocalPropTypes from '../../local-prop-types';
import capitalize from 'lodash/fp/capitalize';
import flatten from 'lodash/fp/flatten';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import map from 'lodash/fp/map';
import sortBy from 'lodash/fp/sortBy';
import uniqBy from 'lodash/fp/uniqBy';
import InfoPopup from '../../util/InfoPopup';

import css from '../common.module.css';

logger.configure({ active: true });


function FrequencySelector({
  allStations, onReady, value, onChange, defaultValueSelector
}) {
  useEffect(() => {
    setDefault();  // TODO: Necessary?
    const actions = {
      getAllOptions: getOptions,
      selectAll: handleClickAll,
      selectNone: handleClickNone,
    };
    onReady(actions);
  }, []);
  
  useEffect(() => {
    setDefault();
  }, [allStations])

  const setDefault = () => {
    onChange(
      defaultValue(defaultValueSelector, getOptions())
    );
  };

  // TODO: Static?
  const makeOptions = memoize(allStations => (
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

  const getOptions = () => makeOptions(allStations);
  const handleClickAll = () => onChange(getOptions());
  const handleClickNone = () => onChange([]);

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
        <Button bsSize={'xsmall'} onClick={handleClickAll}>All</Button>
        <Button bsSize={'xsmall'} onClick={handleClickNone}>None</Button>
      </ButtonToolbar>
      <Select
        options={getOptions()}
        placeholder={
          allStations ? 'Select or type to search...' : 'Loading...'
        }
        value={value}
        onChange={onChange}
        isMulti
      />
    </FormGroup>
  );
}

FrequencySelector.propTypes = {
  allStations: PropTypes.array,
  onReady: PropTypes.func.isRequired,
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  defaultValueSelector: LocalPropTypes.defaultValueSelector,
};

FrequencySelector.defaultProps = {
  onReady: () => null,
  defaultValueSelector: 'all',
};

FrequencySelector.valueToLabel = freq => {
  const labels = {
    '1-hourly': 'Hourly',
    '12-hourly': 'Semi-daily'
  };
  return get(freq, labels) || capitalize(freq) || 'Unspecified';
};

export default FrequencySelector;
