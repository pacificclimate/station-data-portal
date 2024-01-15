import PropTypes from "prop-types";
import React, { Component } from "react";

export default function JSONstringify({ object }) {
  return <pre>{JSON.stringify(object, null, 2)}</pre>;
}
