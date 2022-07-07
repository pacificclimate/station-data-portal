import { useState, useTransition } from 'react';
import { useImmer } from 'use-immer';


export const useStateWithEventHandler = init => {
  const [state, setState] = useState(init);
  return [state, e => setState(e.target.value)]
};


export const useBooleanStateWithToggler = init => {
  const [state, setState] = useState(init);
  return [state, () => setState(!state)];
};


// This hook provides an immer state as in `useImmer`, with some
// added conveniences. The initial state is expected to be hash object. The
// returned `setState` is extended with convenience value setters for each
// top-level key of the initial object. Note: The convenience setters take a
// plain value, not an immer update function as `setState` does.
//
// This arrangement makes it easy to treat a single immutable state as a group
// of named (by key) states, each with its own easy-to-use value setter.
//
// This hook returns the state and setter in the conventional array pair.
export const useImmerByKey = (initial) => {
  const [state, setState] = useImmer(initial);
  for (const key of Object.keys(state)) {
    setState[key] = value => {
      setState(draft => {
        draft[key] = value;
      });
    };
  }
  return [state, setState];
};



// This hook provides a pair of immutable (immer) states, `normal` and
// `transitional`, that are updated together by a single setter. The normal
// state is updated normally -- that is directly, urgently. The transitional
// state is updated inside a transition -- that is, at lower priority.
// The hook returns 4 named items:
//
//    { normal, transitional, isPending, setState }
//
// where `normal` and `transitional` are the states, `isPending` is the
// pending state from the transition, and `setState` updates both states as
// described above.
export const usePairedImmer = (initial) => {
  const [normal, setNormal] = useImmer(initial);
  const [transitional, setTransitional] = useImmer(initial);
  const [isPending, startTransition] = useTransition();
  const setState = update => {
    setNormal(update);
    startTransition(() => {
      setTransitional(update);
    });
  }
  return { normal, transitional, isPending, setState };
};


// This hook provides paired immer states as in `usePairedImmer`, with some
// added conveniences. The initial state is expected to be hash object. The
// returned `setState` is extended with convenience value setters for each
// top-level key of the initial object. Note: The convenience setters take a
// plain value, not an immer update function as `setState` does.
//
// This arrangement makes it easy to treat a single immutable state as a group
// of named (by key) paired states, each with its own easy-to-use value setter.
//
// For example:
//
//    const { normal, transitional, isPending, setState } =
//      usedPairedImmerByKey({ a: 1, b: 2 });
//
// The function `setState`, in addition to being an immer setter as in
// `usePairedImmer`, also has the following convenience state-setting functions
// attached to it:
//
//    setState.a(value)   // updates `normal.a`, `transitional.a` with `value`
//    setState.b(value)   // updates `normal.b`, `transitional.b` with `value`
export const usePairedImmerByKey = (initial) => {
  const pairedImmer = usePairedImmer(initial);
  const { normal, setState } = pairedImmer;
  for (const key of Object.keys(normal)) {
    setState[key] = value => {
      setState(draft => {
        draft[key] = value;
      });
    };
  }
  return pairedImmer;
};
