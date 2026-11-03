import React, { useEffect, useMemo } from "react";
import { Marker, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import { useStationsStore } from "@/state/client/stations-store";
import "./StationFocus.css";

const locatorIconOptions = {
  className: "station-locator",
  html: '<span class="station-locator-ring" aria-hidden="true"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
};

export default function StationFocus() {
  const map = useMap();
  const station = useStationsStore((state) => state.focusedStation);
  // A fresh icon resets the pulse animation on repeated focus requests.
  const locatorIcon = useMemo(() => divIcon(locatorIconOptions), [station]);
  const clearStationFocus = useStationsStore(
    (state) => state.clearStationFocus,
  );
  useEffect(() => {
    if (!station) return;
    const locations = station.histories
      .filter(({ lat, lon }) => Number.isFinite(lat) && Number.isFinite(lon))
      .map(({ lat, lon }) => [lat, lon]);
    if (!locations.length) return;
    let opened = false;
    const openSummary = () => {
      if (opened) return;
      opened = true;
      map.off("moveend", openSummary);
      useStationsStore.getState().requestStationPopup(station.id);
    };
    map.once("moveend", openSummary);
    map.flyToBounds(locations, {
      maxZoom: 10,
      padding: [60, 60],
      duration: 0.8,
    });
    // A stationary map may not emit moveend. Still open its existing popup.
    const popupTimer = setTimeout(openSummary, 1200);
    // Match the three 1.6-second CSS pulses, including reduced-motion mode.
    const timer = setTimeout(clearStationFocus, 4800);
    return () => {
      clearTimeout(timer);
      clearTimeout(popupTimer);
      map.off("moveend", openSummary);
    };
  }, [map, station, clearStationFocus]);

  if (!station) return null;
  const locations = [
    ...new Map(
      station.histories
        .filter(({ lat, lon }) => Number.isFinite(lat) && Number.isFinite(lon))
        .map(({ lat, lon }) => [`${lat},${lon}`, [lat, lon]]),
    ).values(),
  ];
  return locations.map((position) => (
    <Marker
      key={`${station.id}-${position.join(",")}`}
      position={position}
      icon={locatorIcon}
      interactive={false}
      keyboard={false}
      zIndexOffset={1000}
    />
  ));
}
