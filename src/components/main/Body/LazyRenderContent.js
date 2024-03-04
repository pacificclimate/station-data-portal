import { useState, useMemo } from "react";
/**
 * A component to lazily render children, can be used in contexts where
 * existing components only hide children, but don't remove them from the DOM.
 * @param {Object}
 *  visible: boolean, whether to render the children
 *  children: React.ReactNode children to render
 * @returns
 */
export const LazyRenderContent = ({ visible, children }) => {
  const [lazy, setLazy] = useState(false);
  useMemo(() => {
    if (visible) {
      setLazy(true);
    }
  }, [visible]);

  if (!lazy) return null;

  return <>{children}</>;
};

export default LazyRenderContent;
