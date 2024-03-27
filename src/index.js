import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "@/components/main/App";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";

import { bodyLoader } from "@/components/main/Body/bodyLoader";
import { previewLoader } from "@/components/preview/previewLoader";

import "bootstrap/dist/css/bootstrap.css";
import "react-datepicker/dist/react-datepicker.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "./bootstrap-extension.css";
import "./index.css";

/**
 * When deploying the app to a URL that doesn't sit on the domain root we need to let the
 * app router know the location that it at so it knows what portion of the URL it is
 * responsible for.
 *
 * @returns string The base URL of the app
 */
const getBaseName = () => {
  if (process.env.PUBLIC_URL?.indexOf(".") >= 0) {
    return new URL(process.env.PUBLIC_URL).pathname;
  }

  return "";
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      //notifyOnChangeProps: 'tracked',
    },
  },
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
    <Route path="/" element={<App />}>
      <Route
        index
        lazy={() => import("./components/main/Body")}
        loader={bodyLoader(queryClient)}
      />
      <Route
        path="preview/:stationId"
        lazy={() => import("./components/preview/StationPreview")}
        loader={previewLoader(queryClient)}
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
  </QueryClientProvider>,
);
