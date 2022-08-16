import React from 'react';
import { createRoot } from 'react-dom/client';
import CheckboxControl from '../CheckboxControl';

it('renders without crashing', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    root.render(
      <CheckboxControl label={"Hello?"} value={false} onChange={() => {}}/>
    );
});
