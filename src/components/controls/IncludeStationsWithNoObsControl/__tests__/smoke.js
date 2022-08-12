import React from 'react';
import { createRoot } from 'react-dom/client';
import IncludeStationsWithNoObsControl
    from '../IncludeStationsWithNoObsControl';

it('renders without crashing', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    root.render(
      <IncludeStationsWithNoObsControl value={false} onChange={() => {}}/>
    );
});

