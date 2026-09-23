import React from "react";
import { renderWithProviders } from "@/test-utils";
import StationMetadata from "../StationMetadata";

it("renders without crashing", () => {
  renderWithProviders(
    <StationMetadata stations={[]} allNetworks={[]} allVariables={[]} />,
  );
});
