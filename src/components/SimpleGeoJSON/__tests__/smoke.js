import React from 'react';
import { createRoot } from 'react-dom/client';
import SimpleGeoJSON from '../SimpleGeoJSON';

it('renders without crashing', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
    root.render(<SimpleGeoJSON/>);
});
