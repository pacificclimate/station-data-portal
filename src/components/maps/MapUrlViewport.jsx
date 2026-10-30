import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useStationsStore } from "@/state/client/stations-store";
import { validViewport } from "@/utils/workspace-url";

export default function MapUrlViewport() {
  const map = useMap();
  useEffect(() => {
    const current = () => {
      const center = map.getCenter();
      return [
        Number(center.lat.toFixed(6)),
        Number(center.lng.toFixed(6)),
        map.getZoom(),
      ];
    };
    const publish = () => {
      const next = current();
      if (
        validViewport(next) &&
        JSON.stringify(next) !==
          JSON.stringify(useStationsStore.getState().mapViewport)
      )
        useStationsStore.getState().setMapViewport(next);
    };
    const restore = (viewport) => {
      if (!viewport || JSON.stringify(current()) === JSON.stringify(viewport))
        return;
      const [lat, lon, zoom] = viewport;
      map.setView(
        [lat, lon],
        Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), zoom)),
        { animate: false },
      );
    };
    restore(useStationsStore.getState().mapViewport);
    map.on("moveend zoomend", publish);
    publish();
    const unsubscribe = useStationsStore.subscribe((state, previous) => {
      if (state.mapViewport !== previous.mapViewport)
        restore(state.mapViewport);
    });
    return () => {
      unsubscribe();
      map.off("moveend zoomend", publish);
    };
  }, [map]);
  return null;
}
