import { useState } from "react";
import DatePicker from "react-datepicker";
import { useStore } from "../../../state/state-store";
import css from "./EndDateControl.module.css";

export const EndDateControl = () => {
  const { minStartDate, maxEndDate, selectedEndDate, setSelectedEndDate } =
    useStore((state) => ({
      minStartDate: state.minStartDate,
      maxEndDate: state.maxEndDate,
      selectedEndDate: state.selectedEndDate,
      setSelectedEndDate: state.setSelectedEndDate,
    }));

  const isValid = (date) => {
    return date >= minStartDate && date <= maxEndDate;
  };

  const handleDateChange = (date) => {
    // if the date is valid, update the store and let it pull new data
    if (isValid(date)) {
      setSelectedEndDate(date);
    }
  };

  return (
    <DatePicker
      className="form-control"
      wrapperClassName={["form-control", css.datepicker].join(" ")}
      selected={selectedEndDate}
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
