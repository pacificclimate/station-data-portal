/**
 * A component to conditionally render children, can be used in contexts where
 * existing components only hide children, but don't remove them from the DOM.
 * @param {Object}
 *  visible: boolean, whether to render the children
 *  children: React.ReactNode children to render
 * @returns
 */
export const NoRenderContent = ({ visible, children }) => {
  if (!visible) return null;

  return <>{children};</>;
};

export default NoRenderContent;
