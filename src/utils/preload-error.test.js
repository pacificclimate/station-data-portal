import { describe, it, expect, vi } from "vitest";
import {
  createPreloadErrorHandler,
  RELOAD_WINDOW_MS,
  RELOADED_AT_KEY,
} from "./preload-error";

const memoryStorage = (initial = {}) => {
  const items = { ...initial };
  return {
    getItem: (key) => (key in items ? items[key] : null),
    setItem: (key, value) => {
      items[key] = value;
    },
  };
};

const preloadError = () => new Event("vite:preloadError", { cancelable: true });

const setup = ({ storage = memoryStorage(), now = 1_000_000 } = {}) => {
  const reload = vi.fn();
  const handler = createPreloadErrorHandler({
    storage: () => storage,
    reload,
    now: () => now,
  });
  return { handler, reload, storage };
};

describe("createPreloadErrorHandler", () => {
  it("reloads and suppresses the error on the first failure", () => {
    const { handler, reload, storage } = setup();
    const event = preloadError();
    handler(event);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
    expect(storage.getItem(RELOADED_AT_KEY)).toBe("1000000");
  });

  it("suppresses later events in the same page without reloading again", () => {
    const { handler, reload } = setup();
    handler(preloadError());
    const second = preloadError();
    handler(second);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(second.defaultPrevented).toBe(true);
  });

  it("lets the error surface when the page just reloaded for one", () => {
    const now = 1_000_000;
    const { handler, reload } = setup({
      storage: memoryStorage({
        [RELOADED_AT_KEY]: String(now - RELOAD_WINDOW_MS + 1),
      }),
      now,
    });
    const event = preloadError();
    handler(event);
    expect(reload).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("reloads again once the last reload is outside the window", () => {
    const now = 1_000_000;
    const { handler, reload } = setup({
      storage: memoryStorage({
        [RELOADED_AT_KEY]: String(now - RELOAD_WINDOW_MS),
      }),
      now,
    });
    handler(preloadError());
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("doesn't reload when storage is unavailable", () => {
    const reload = vi.fn();
    const handler = createPreloadErrorHandler({
      storage: () => {
        throw new DOMException("blocked", "SecurityError");
      },
      reload,
    });
    const event = preloadError();
    handler(event);
    expect(reload).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
