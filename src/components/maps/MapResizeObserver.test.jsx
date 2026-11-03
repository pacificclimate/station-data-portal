import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import MapResizeObserver from "./MapResizeObserver";

const { map } = vi.hoisted(() => ({
  map: { invalidateSize: vi.fn(), getContainer: vi.fn() },
}));
vi.mock("react-leaflet", () => ({ useMap: () => map }));
afterEach(() => vi.unstubAllGlobals());

it("updates the map when its available space changes and disconnects on unmount", () => {
  let onResize;
  const observe = vi.fn();
  const disconnect = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback) {
        onResize = callback;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
  const container = document.createElement("div");
  map.getContainer.mockReturnValue(container);
  const { unmount } = render(<MapResizeObserver />);
  expect(observe).toHaveBeenCalledWith(container);
  onResize();
  expect(map.invalidateSize).toHaveBeenCalledWith({ pan: false });
  unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});
