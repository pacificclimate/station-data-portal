// Local prop types declarations.
// Exported as a single object, to parallel prop-types package.

import PropTypes from "prop-types";

export default {
  defaultValueSelector: PropTypes.oneOfType([
    PropTypes.oneOf(["all", "none"]),
    PropTypes.func,
  ]),
};
