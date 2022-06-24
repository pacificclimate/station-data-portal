import cond from 'lodash/fp/cond';
import isEqual from 'lodash/fp/isEqual';
import constant from 'lodash/fp/constant';
import isFunction from 'lodash/fp/isFunction';
import filter from 'lodash/fp/filter';
import stubTrue from 'lodash/fp/stubTrue';
import identity from 'lodash/fp/identity';

export const defaultValue = (defaultValueSelector, allOptions) => cond([
  [isEqual('none'), constant(constant([]))],
  [isFunction, filter],
  [stubTrue, constant(identity)],
])(defaultValueSelector)(allOptions);

// For styling All, None, etc. buttons in selectors
export const selectorButtonProps = {
  size: "xs", variant: "outline-dark", className: "ms-1"
};

