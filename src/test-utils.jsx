import React from "react";
import { render } from "@testing-library/react";
import { MapContainer } from "react-leaflet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigContext } from "@/state/context-hooks/use-config-context";
import { StationFilteringContext } from "@/state/context-hooks/use-station-filtering-context";

// A stand-in for the runtime `window.env` config (see public/config.js),
// carrying only the keys components read during a render.
export const testConfig = {
  appTitle: "Station Data Portal (test)",
  appVersion: "test",
  baseMap: "BC",
  defaultNetworkColor: "#000000",
  userDocs: { showLink: false, url: "", text: "" },
  sdsUrl: "https://example.invalid/metadata/",
  pdpDataUrl: "https://example.invalid/data/",
};

// Queries are never expected to resolve in these tests: there is no server, and
// the components under test only have to survive the pending/error states.
// `retry: false` keeps a failed fetch from being retried for the rest of the run.
const testQueryClient = (seedQueries) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  // Seeded entries are already fresh cache hits, so the component sees resolved
  // data on its first render and no request is ever made.
  for (const [queryKey, data] of seedQueries) {
    client.setQueryData(queryKey, data);
  }
  return client;
};

/**
 * Render `ui` inside the providers the app supplies in production.
 *
 * Both contexts default to `null`, so a component reading either one throws
 * without a provider. Rendering through @testing-library/react (rather than a
 * bare `createRoot`) also wraps the render in `act`, so such a throw surfaces
 * as a test failure instead of an unhandled error after the test has returned.
 *
 * Pass `withMap` for components that render react-leaflet layers (markers,
 * popups); those read Leaflet's own context and cannot mount outside a map.
 *
 * Pass `seedQueries` as `[[queryKey, data], ...]` for components that read a
 * query's data during render. Without it those queries are perpetually pending
 * and `data` is `undefined`, which several components do not guard against.
 */
export const renderWithProviders = (
  ui,
  {
    config = testConfig,
    stationFiltering = { selectedStations: [] },
    withMap = false,
    seedQueries = [],
  } = {},
) =>
  render(
    <QueryClientProvider client={testQueryClient(seedQueries)}>
      <ConfigContext.Provider value={config}>
        <StationFilteringContext.Provider value={stationFiltering}>
          {withMap ? (
            <MapContainer center={[50, -125]} zoom={6}>
              {ui}
            </MapContainer>
          ) : (
            ui
          )}
        </StationFilteringContext.Provider>
      </ConfigContext.Provider>
    </QueryClientProvider>,
  );
