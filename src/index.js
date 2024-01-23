import "bootstrap/dist/css/bootstrap.css";
import "react-datepicker/dist/react-datepicker.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { createRoot } from "react-dom/client";

import "./bootstrap-extension.css";
import "./index.css";

import App from "./components/main/App";
import StationPreview, {
  loader as stationLoader,
} from "./components/preview/StationPreview";
import registerServiceWorker from "./registerServiceWorker";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "preview/:stationId",
    element: <StationPreview />,
    loader: stationLoader,
  },
]);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<RouterProvider router={router} />);
registerServiceWorker();
