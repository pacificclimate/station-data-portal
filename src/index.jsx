import "bootstrap/dist/css/bootstrap.css";
import "react-datepicker/dist/react-datepicker.css";
import "leaflet-draw/dist/leaflet.draw.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Routes,
  Route,
} from "react-router-dom";
import Body from "./components/main/Body/Body";

import { createRoot } from "react-dom/client";

import "./bootstrap-extension.css";
import "./index.css";

import App from "./components/main/App/App";
import StationPreview, {
  loader as stationLoader,
} from "./components/preview/StationPreview/StationPreview";
import registerServiceWorker from "./registerServiceWorker";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Body />} />
      <Route
        path="preview/:stationId"
        element={<StationPreview />}
        loader={stationLoader}
      />
    </Route>,
  ),
);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<RouterProvider router={router} />);
registerServiceWorker();
