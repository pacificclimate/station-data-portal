import chroma from "chroma-js";

export const NetworkSpot = ({ color }) => (
  <div
    style={{
      width: "1em",
      height: "1em",
      borderRadius: "0.5em",
      backgroundColor: chroma(color).css(),
    }}
  >
    &nbsp;
  </div>
);
