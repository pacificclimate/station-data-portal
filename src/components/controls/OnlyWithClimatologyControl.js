import React from "react";

import CheckboxControl from "./CheckboxControl";
import { useStationsStore } from "@/state/client/stations-store";

export default function OnlyWithClimatologyControl() {
  const { onlyWithClimatology: value, toggleOnlyWithClimatology: onChange } =
    useStationsStore((state) => ({
      onlyWithClimatology: state.onlyWithClimatology,
      toggleOnlyWithClimatology: state.toggleOnlyWithClimatology,
    }));
  const label = "Only include stations with climatology";
  return <CheckboxControl {...{ value, onChange, label }} />;
}
