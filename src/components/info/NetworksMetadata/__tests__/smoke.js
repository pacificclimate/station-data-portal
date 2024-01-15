import React from "react";
import { createRoot } from "react-dom/client";
import NetworksMetadata from "../NetworksMetadata";

it("renders without crashing", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  root.render(<NetworksMetadata allNetworks={[]} />);
});
