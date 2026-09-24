import React from "react";
import { renderWithProviders } from "@/test-utils";
import ObservationCounts from "../ObservationCounts";

it("renders without crashing", () => {
  renderWithProviders(<ObservationCounts />);
});
