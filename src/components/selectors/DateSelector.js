import PropTypes from "prop-types";
import React from "react";
import { Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import InfoPopup from "@/components/util/InfoPopup/InfoPopup";

import "./DateSelector.module.css";

function DateSelector({ value, onChange, label, ...restProps }) {
  return (
    <Form>
      <Form.Label>{label}</Form.Label>{" "}
      <InfoPopup title={label}>
        Only stations matching Start Date and End Date are selected. A station
        matches if the date of any observation for a station falls within the
        specified Start and End dates. An empty Start or End date matches any
        observation date.
      </InfoPopup>{" "}
      <DatePicker
        selected={value}
        onChange={onChange}
        dateFormat={"yyyy-MM-dd"}
        isClearable
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        {...restProps}
      />
    </Form>
  );
}

DateSelector.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
};

export default DateSelector;
