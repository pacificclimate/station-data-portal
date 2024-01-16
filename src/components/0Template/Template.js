import PropTypes from "prop-types";
import React from "react";

import logger from "../../logger";

import "./Template.css";

logger.configure({ active: true });

function Template({ a }) {
  return <div>Template</div>;
}

Template.propTypes = {};

export default Template;
