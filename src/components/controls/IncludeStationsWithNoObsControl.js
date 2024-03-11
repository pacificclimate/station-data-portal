import React from "react";
import { useShallow } from "zustand/react/shallow";

import InfoPopup from "@/components/util/InfoPopup";
import CheckboxControl from "./CheckboxControl";
import { useStationsStore } from "@/state/client/stations-store";

export default function IncludeStationsWithNoObsControl() {
  const { value, onChange } = useStationsStore(
    useShallow((state) => ({
      value: state.includeStationsWithNoObs,
      onChange: state.toggleIncludeStationsWithNoObs,
    })),
  );
  const label = "Include stations with no observations";
  return (
    <CheckboxControl
      {...{ label, value, onChange }}
      children={
        <InfoPopup title={label}>
          <p>
            This control affects filtering on Date, Variable, and Observation
            Frequency.
          </p>
          <p>
            If this control is checked, then stations with no observations are
            selected regardless of the settings of those filters.
          </p>
          <p>
            If this control is not checked, filtering is applied as usual with
            those filters, with the result that stations with no observations
            are not selected.
          </p>
          <p>
            To see only stations with no observations, check this control and
            set Variable or Frequency filtering to none.
          </p>
        </InfoPopup>
      }
    />
  );
}
