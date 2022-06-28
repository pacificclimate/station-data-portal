import React from 'react';
import { createRoot } from 'react-dom/client';
import OnlyWithClimatologyControl from '../OnlyWithClimatologyControl';

it('renders without crashing', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    root.render(
      <OnlyWithClimatologyControl value={false} onChange={() => {}}/>
    );
});

