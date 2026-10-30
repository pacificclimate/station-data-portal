import React from "react";

export default function StationLocation({ location }) {
  const coordinate = (label, value, positive, negative) => (
    <div>
      <span className="station-location-label">{label}:</span>
      <span>
        {Number.isFinite(value) ? `${Math.abs(value).toFixed(5)}°` : "Unknown"}
      </span>
      <span className="station-location-unit">
        {Number.isFinite(value) ? (value < 0 ? negative : positive) : ""}
      </span>
    </div>
  );
  return (
    <div
      className="station-location"
      title={`Latitude: ${location.lat ?? "unknown"}; Longitude: ${location.lon ?? "unknown"}; Elevation: ${location.elevation ?? "unknown"}`}
    >
      {coordinate("Lat", location.lat, "N", "S")}
      {coordinate("Lon", location.lon, "E", "W")}
      <div>
        <span className="station-location-label">Elev:</span>
        <span>{location.elevation ?? "Unknown"}</span>
        <span className="station-location-unit">
          {location.elevation == null ? "" : "m"}
        </span>
      </div>
    </div>
  );
}
