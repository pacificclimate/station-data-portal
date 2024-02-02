import React from "react";
import { createRoot } from "react-dom/client";
import AdjustableColumns from "../AdjustableColumns";

it("renders without crashing", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  root.render(
    <AdjustableColumns
      defaultLgs={[6, 6]}
      contents={[<div>alpha</div>, <div>beta</div>]}
    />,
  );
});
