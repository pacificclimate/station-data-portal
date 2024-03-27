import React from "react";
import { createRoot } from "react-dom/client";
import FileFormatSelector from "../FileFormatSelector";
import noop from "lodash/noop";

it("renders without crashing", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  root.render(<FileFormatSelector onChange={noop} />);
});
