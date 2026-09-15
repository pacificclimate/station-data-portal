import React from "react";
import { useShallow } from "zustand/react/shallow";
import pick from "lodash/fp/pick";

import CheckboxControl from "./CheckboxControl";
import { useStationsStore } from "@/state/client/stations-store";

export default function OnlyWithClimatologyControl() {
  const { onlyWithClimatology: value, toggleOnlyWithClimatology: onChange } =
    useStationsStore(
      useShallow(pick(["onlyWithClimatology", "toggleOnlyWithClimatology"])),
    );
  const label = "Only include stations with climatology";
  return <CheckboxControl {...{ value, onChange, label }} />;
}
