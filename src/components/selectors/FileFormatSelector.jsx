import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Form } from "react-bootstrap";
import Select from "react-select";

import logger from "@/logger";

logger.configure({ active: true });

const options = [
  {
    label: "NetCDF",
    value: "nc",
  },
  {
    label: "CSV/ASCII",
    value: "csv",
  },
  {
    label: "MS Excel 2010",
    value: "xlsx",
  },
];

export const FileFormatSelector = ({ value, onChange }) => {
  useEffect(() => {
    onChange(options[0]);
  }, []);

  return (
    <Form>
      <div>
        <Form.Label>Output format</Form.Label>
      </div>
      <Select options={options} value={value} onChange={onChange} />
    </Form>
  );
};

FileFormatSelector.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default FileFormatSelector;
