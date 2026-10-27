import { useEffect } from "react";
import { useMap } from "react-leaflet";

// Keep tiles, controls and popup positioning aligned as the side panel changes.
export default function MapResizeObserver() {
  const map = useMap();
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ pan: false });
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}
