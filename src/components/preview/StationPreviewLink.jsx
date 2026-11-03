import React from "react";
import { Link, useLocation } from "react-router-dom";

// Real links support copy, open in a new tab and direct visits as well as dialogs.
const StationPreviewLink = React.forwardRef(function StationPreviewLink(
  { stationId, ...props },
  ref,
) {
  const location = useLocation();
  return (
    <Link
      {...props}
      ref={ref}
      to={{ pathname: `/preview/${stationId}`, search: location.search }}
      state={{
        previewFrom: { pathname: location.pathname, search: location.search },
      }}
    />
  );
});
export default StationPreviewLink;
