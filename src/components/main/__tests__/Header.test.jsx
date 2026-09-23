import React from "react";
import { renderWithProviders } from "@/test-utils";
import Header from "../Header";

it("renders without crashing", () => {
  renderWithProviders(<Header />);
});
