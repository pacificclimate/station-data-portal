// A failed chunk load after a deploy usually means the page is running the
// previous build, whose hashed chunks are gone. Reloading fetches the new
// index.html and its chunks. https://vite.dev/guide/build#load-error-handling

// A failure within this long of the last reload is treated as a chunk that is
// really missing, so it surfaces as an error instead of reloading again.
export const RELOAD_WINDOW_MS = 60_000;

export const RELOADED_AT_KEY = "vite:preloadError:reloadedAt";

/**
 * Makes a `vite:preloadError` listener that reloads the page once.
 *
 * `storage` returns the storage to record the reload in; it's a function
 * because reading `window.sessionStorage` can itself throw. When storage is
 * unavailable the page doesn't reload, since nothing would stop a loop.
 *
 * One navigation can raise several events (one per failed dependency, then
 * the import itself), so once a reload is under way every later event is
 * suppressed too.
 */
export const createPreloadErrorHandler = ({
  storage,
  reload,
  now = Date.now,
}) => {
  let reloading = false;
  return (event) => {
    if (!reloading) {
      try {
        const reloadedAt = Number(storage().getItem(RELOADED_AT_KEY));
        if (now() - reloadedAt < RELOAD_WINDOW_MS) {
          return;
        }
        storage().setItem(RELOADED_AT_KEY, String(now()));
      } catch {
        return;
      }
      reloading = true;
      reload();
    }
    event.preventDefault();
  };
};
