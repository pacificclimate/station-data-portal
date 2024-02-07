import React, { Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./components/main/App";

import "bootstrap/dist/css/bootstrap.css";
import "react-datepicker/dist/react-datepicker.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "./bootstrap-extension.css";
import "./index.css";

import registerServiceWorker from "./registerServiceWorker";

// Code split our bundle along our primary routes using the "lazy" function.
// https://reactrouter.com/en/main/route/lazy
// Stationpreview in particular is large due to including the plotly library.
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index lazy={() => import("./components/main/Body")} />
      <Route
        path="preview/:stationId"
        lazy={() => import("./components/preview/StationPreview")}
      />
    </Route>,
  ),
);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<RouterProvider router={router} />);
registerServiceWorker();
