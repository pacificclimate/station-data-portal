import React from 'react';
import ReactDOM from 'react-dom';
import BaseMapSelector from '../BaseMapSelector';
import noop from 'lodash/noop';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <BaseMapSelector
        onChange={noop} value={null}
      />,
      div
    );
});

