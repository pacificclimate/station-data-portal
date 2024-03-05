import React from "react";
import PropTypes from "prop-types";

export const KVLabel = ({ label, value, formatter }) => {
  return (
    <>
      {value && (
        <p>
          <strong>{label}</strong> {formatter ? formatter(value) : value}
        </p>
      )}
    </>
  );
};

KVLabel.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  formatter: PropTypes.func,
};

export default KVLabel;
