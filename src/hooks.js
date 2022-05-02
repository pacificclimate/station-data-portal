import { useState } from 'react';

export const useStateWithEventHandler = init => {
  const [state, setState] = useState(init);
  return [state, e => setState(e.target.value)]
};

export const useBooleanStateWithToggler = init => {
  const [state, setState] = useState(init);
  return [state, () => setState(!state)];
};


