import { useState } from "react";
import DatePicker from "react-datepicker";
import { useStore } from "../../../state/state-store";
import css from "./EndDateControl.module.css";

export const EndDateControl = ({ initialDate }) => {
  const { minStartDate, maxEndDate, setSelectedEndDate } = useStore(
    (state) => ({
      minStartDate: state.minStartDate,
      maxEndDate: state.maxEndDate,
      setSelectedEndDate: state.setSelectedEndDate,
    }),
  );

  console.log("### ", initialDate);
  const [endingDate, setEndingDate] = useState(initialDate);

  const isValid = (date) => {
    return date >= minStartDate && date <= maxEndDate;
  };

  const handleDateChange = (date) => {
    // always update our react control's state
    setEndingDate(date);
    // if the date is valid, update the store and let it pull new data
    if (isValid(date)) {
      setSelectedEndDate(date);
    }
  };

  return (
    <DatePicker
      className="form-control"
      wrapperClassName={["form-control", css.datepicker].join(" ")}
      selected={initialDate}
      onChange={handleDateChange}
      dateFormat={"yyyy-MM-dd"}
      peekNextMonth
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
    />
  );
};

export default EndDateControl;
