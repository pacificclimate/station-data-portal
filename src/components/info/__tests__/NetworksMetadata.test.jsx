import React from "react";
import { renderWithProviders } from "@/test-utils";
import NetworksMetadata from "../NetworksMetadata";

it("renders without crashing", () => {
  renderWithProviders(<NetworksMetadata allNetworks={[]} />);
});
