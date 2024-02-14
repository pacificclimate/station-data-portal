import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./components/main/App";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "bootstrap/dist/css/bootstrap.css";
import "react-datepicker/dist/react-datepicker.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "./bootstrap-extension.css";
import "./index.css";

import registerServiceWorker from "./registerServiceWorker";

/**
 * When deploying the app to a URL that doesn't sit on the domain root we need to let the
 * app router know the location that it at so it knows what portion of the URL it is
 * responsible for.
 *
 * @returns string The base URL of the app
 */
const getBaseName = () => {
  if (process.env.PUBLIC_URL) {
    if (process.env.PUBLIC_URL.indexOf(".") >= 0) {
      return new URL(process.env.PUBLIC_URL).pathname;
    } else {
      // for development
      return process.env.PUBLIC_URL;
    }
  }
  return "/";
};

// Create a client
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) =>
      console.error("An error occurred in the query cache", error),
  }),
});

// Code split our bundle along our primary routes using the "lazy" function.
// https://reactrouter.com/en/main/route/lazy
// Stationpreview in particular is large due to including the plotly library.
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="" element={<App />}>
      <Route index lazy={() => import("./components/main/Body")} />
      <Route
        path="preview/:stationId"
        lazy={() => import("./components/preview/StationPreview")}
      />
    </Route>,
  ),
  {
    basename: getBaseName(),
  },
);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
);
registerServiceWorker();
