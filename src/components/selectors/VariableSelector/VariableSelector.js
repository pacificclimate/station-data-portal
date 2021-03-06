import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Button, ButtonToolbar, ControlLabel, FormGroup } from 'react-bootstrap';
import Select from 'react-select';
import memoize from 'memoize-one';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import flatten from 'lodash/fp/flatten';
import some from 'lodash/fp/some';
import includes from 'lodash/fp/includes';
import sortBy from 'lodash/fp/sortBy';
import flow from 'lodash/fp/flow';
import tap from 'lodash/fp/tap';
import { groupByGeneral } from '../../../utils/fp';
import { defaultValue } from '../common';

import logger from '../../../logger';

import LocalPropTypes from '../../local-prop-types';

import css from '../common.module.css';

logger.configure({ active: true });


// TODO: Update pcic-react-components GroupingSelector to communicate options
// and reuse here? Right now there is a lot of repetition of function.

const flattenOptions = flow(
  map(group => group.options),
  flatten,
  filter(option => !option.isDisabled),
);

class VariableSelector extends Component {
  static propTypes = {
    allVariables: PropTypes.array.isRequired,
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
    if (this.props.allVariables !== prevProps.allVariables) {
      this.setDefault();
    }
  }

  setDefault = () => {
    this.props.onChange(
      defaultValue(this.props.defaultValueSelector, this.getFlattenedOptions())
    );
  };

  static variableType = contexts => {
    const types = [
      {
        condition: some(context =>
          includes('temperature', context.short_name) &&
          !includes('dew_point', context.short_name)
        ),
        value: {
          label: 'Temperature',
          code: 'temperature'
        },
      },
      {
        condition: some(context =>
          includes('precipitation', context.short_name) ||
          includes('rain', context.short_name) ||
          includes('snow', context.short_name)
        ),
        value: {
          label: 'Precipitation',
          code: 'precipitation',
        },
      },
      {
        condition: some(context =>
          includes('humidity', context.short_name) ||
          includes('dew_point', context.short_name)
        ),
        value: {
          label: 'Humidity',
          code: 'humidity',
        },
      },
      {
        condition: some(context =>
          includes('wind', context.short_name)
        ),
        value: {
          label: 'Wind',
          code: 'wind',
        },
      },
      {
        condition: () => true,
        value: {
          label: 'Miscellaneous',
          code: 'misc',
        },
      },
    ];

    for (const [order, type] of types.entries()) {
      if (type.condition(contexts)) {
        return {
          ...type.value,
          order,
        };
      }
    }

    // Just in case I'm dumber than I think I am.
    return {
      label: 'Programmer Fail',
      type: 'fail',
      order: 999,
    };
  };

  // This function must be an instance property to be memoized correctly.
  makeOptions = memoize(allVariables => (
    allVariables === null ?
      [] :
      flow(
        tap(allVariables => console.log('allVariables', allVariables)),

        // Create one option per unique variable display_name.
        map(variable => ({
          context: variable,
          value: variable.display_name,
        })),
        groupByGeneral(({ value }) => value),
        map(group => ({
          contexts: map(item => item.context)(group.items),
          value: group.by,
          label: group.by,
        })),
        sortBy('label'),
        tap(options => console.log('ungrouped variable options', options)),

        // Group options by variable type: temp, precip, humidity, wind, misc.
        groupByGeneral(({ contexts }) => (
          VariableSelector.variableType(contexts)
        )),

        // Create from the grouped options a grouped options object that
        // React Select can consume.
        map(group => ({
          ...group.by,
          options: group.items,
        })),
        sortBy('order'),

        tap(options => console.log('grouped variable options', options)),
      )(allVariables)
  ));

  getOptions = () => this.makeOptions(this.props.allVariables);
  getFlattenedOptions = () => flattenOptions(this.getOptions());

  handleClickAll = () => this.props.onChange(this.getFlattenedOptions());

  makeHandleClickGroup = group =>
    (() => this.props.onChange(group.options));

  handleClickNone = () => this.props.onChange([]);

  render() {
    const options = this.getOptions();
    return (
      <FormGroup>
        <div><ControlLabel>Variable</ControlLabel></div>
        <ButtonToolbar className={css.selectorButtons}>
          <Button bsSize={'xsmall'} onClick={this.handleClickAll}>All</Button>
          {
            map(group => (
              <Button
                key={group.label}
                bsSize={'xsmall'}
                onClick={this.makeHandleClickGroup(group)}
              >
                {`All ${group.label}`}
              </Button>
            ))(options)
          }
          <Button bsSize={'xsmall'} onClick={this.handleClickNone}>None</Button>
        </ButtonToolbar>
        <Select
          options={options}
          placeholder={
            this.props.allVariables ? 'Select or type to search...' : 'Loading...'
          }
          {...this.props}
          isMulti
        />
      </FormGroup>
    );
  }
}

export default VariableSelector;
