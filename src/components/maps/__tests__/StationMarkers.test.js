import React from "react";
import { createRoot } from "react-dom/client";
import { OneStationMarkers } from "../StationMarkers";
import stations from "@/utils/__test_data__/stations-bc.json";

const station = stations[0];

it("renders without crashing", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  root.render(<OneStationMarkers station={station} />);
});
