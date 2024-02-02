import React from "react";
import { createRoot } from "react-dom/client";
import ClipToDateControl from "../ClipToDateControl";

it("renders without crashing", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  root.render(<ClipToDateControl value={false} onChange={() => {}} />);
});
