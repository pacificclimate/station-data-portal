import { renderHook, act } from '@testing-library/react';
import { usePairedImmer, usePairedImmerByKey } from "./hooks";


describe("usePairedImmer", () => {
  const initial = { a: 1, b: 2 };

  it("renders initial state in both state objects", () => {
    const { result } = renderHook(() => usePairedImmer(initial));
    for (const key of Object.keys(initial)) {
      expect(result.current.normal[key]).toBe(initial[key]);
      expect(result.current.transitional[key]).toBe(initial[key]);
    }
    expect(result.current.isPending).toBe(false);
  });

  it("updates both state objects", () => {
    const { result } = renderHook(() => usePairedImmer(initial));
    expect(result.current.normal.a).toBe(initial.a);
    act(() => {
      result.current.setState(draft => {
        draft.a = 99;
      })
    });
    expect(result.current.normal.a).toBe(99);
    expect(result.current.transitional.a).toBe(99);
  });

  // it("contains expected convenience setters", () => {
  //   const [normal, transitional, isPending, setState] = result.current;
  //   for (const key of Object.keys(initial)) {
  //     expect(setState[key]).toBeDefined;
  //   }
  // });
});

describe("usePairedImmerByKey", () => {
  const initial = { a: 1, b: 2 };

  it("renders initial state in both state objects", () => {
    const { result } = renderHook(() => usePairedImmerByKey(initial));
    for (const key of Object.keys(initial)) {
      expect(result.current.normal[key]).toBe(initial[key]);
      expect(result.current.transitional[key]).toBe(initial[key]);
    }
    expect(result.current.isPending).toBe(false);
  });

  it("adds the convenience setters, and they work", () => {
    const { result } = renderHook(() => usePairedImmerByKey(initial));
    for (const key of Object.keys(initial)) {
      expect(result.current.setState[key]).toBeDefined();
    }

    expect(result.current.normal.a).toBe(initial.a);
    act(() => {
      result.current.setState.a(99)
    });
    expect(result.current.normal.a).toBe(99);
    expect(result.current.transitional.a).toBe(99);
  });


});


