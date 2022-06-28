import React from 'react';
import { createRoot } from 'react-dom/client';
import DateSelector from '../DateSelector';
import noop from 'lodash/noop';

it('renders without crashing', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    root.render(
      <DateSelector onChange={noop} label={"Test"}/>
    );
});

