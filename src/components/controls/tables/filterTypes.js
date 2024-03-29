// Custom column filter functions (not UIs).
// This module mostly copied from wx-files-frontend.

export function textStartsWith(rows, id, filterValue) {
  return rows.filter((row) => {
    const rowValue = row.values[id];
    return rowValue !== undefined
      ? String(rowValue)
          .toLowerCase()
          .startsWith(String(filterValue).toLowerCase())
      : true;
  });
}
textStartsWith.autoRemove = (val) => !val;
textStartsWith.filterName = "Starts with";

// A more forgiving 'includes' filter.

export const includesIfDefined = (rows, ids, filterValue) => {
  return rows.filter((row) => {
    return ids.some((id) => {
      const rowValue = row.values[id];
      return rowValue && rowValue.includes(filterValue);
    });
  });
};
includesIfDefined.autoRemove = (val) => !val || !val.length;
includesIfDefined.filterName = "Includes";

// Factory for an includes filter for array-valued rows; array elements of
// single type, specified as a factory argument (e.g., String).
// Resulting function matchers any row whose array contains the filter value
// (requires an exact, case-sensitive match), or passes all rows for specified
// "all" value.
export const includesExactInArrayOfType =
  (type, all) => (rows, ids, filterValue) => {
    if (filterValue === all) {
      return rows;
    }
    return rows.filter((row) => {
      return ids.some((id) => {
        const rowValue = row.values[id];
        return rowValue.includes(type(filterValue));
      });
    });
  };

export const includesInArrayOfString = includesExactInArrayOfType(String, "*");
includesInArrayOfString.autoRemove = (val) => !val || !val.length;
includesInArrayOfString.filterName = "One item equals";

// A more forgiving includes filter for array-valued rows; array of Strings.
// Matches any row whose array contains the filter value (requires only
// case-insensitive, partial string match to one of the row values).
export const includesSubstringInArrayOfString = (rows, ids, filterValue) => {
  return rows.filter((row) => {
    return ids.some((id) => {
      const rowValues = row.values[id];
      // Case-insensitive, partial string match to one of the row values
      return rowValues.some((value) => {
        return (
          value?.toLowerCase()?.includes(filterValue?.toLowerCase()) ?? true
        );
      });
    });
  });
};
includesSubstringInArrayOfString.autoRemove = (val) => !val || !val.length;
includesSubstringInArrayOfString.filterName = "One item matches";

// Custom filter that matches exactly or passes all rows with specified "all"
// value.
export const exactOrAll = (all) => (rows, ids, filterValue) => {
  if (filterValue === all) {
    return rows;
  }
  return rows.filter((row) => {
    return ids.some((id) => {
      const rowValue = row.values[id];
      return rowValue === filterValue;
    });
  });
};

export const exactOrAllAsterisk = exactOrAll("*");
exactOrAllAsterisk.autoRemove = (val) => typeof val === "undefined";
exactOrAllAsterisk.filterName = "All or exactly one";

// Custom filter for coordinates within a bounding box defined in km.
export function coordinatesInBox(rows, id, filterValue) {
  const [latCentre, lonCentre, distance] = filterValue;

  const bounds = (center, tolerance) => [
    center - tolerance,
    center + tolerance,
  ];

  const inBounds = (value, [min, max]) => value >= min && value <= max;

  // approx km / deg lat at Canadian latitudes
  // (varies by < 1% from equator to pole, according to ellipsoid)
  const latTolerance = distance / 111.2;
  const latBounds = bounds(latCentre, latTolerance);

  // approx km / deg lon at specified latitude; if latitude unspecified, use
  // a default value of 55.
  const lonTolerance =
    distance / (111.32 * Math.cos(((latCentre || 55.0) / 180) * Math.PI));
  const lonBounds = bounds(lonCentre, lonTolerance);

  return rows.filter((row) => {
    const [latitude, longitude] = row.values[id];
    return (
      (!latCentre || inBounds(latitude, latBounds)) &&
      (!lonCentre || inBounds(longitude, lonBounds))
    );
  });
}
coordinatesInBox.autoRemove = (val) =>
  !val ||
  (typeof val[0] !== "number" &&
    typeof val[1] !== "number" &&
    typeof val[2] !== "number");
coordinatesInBox.filterName = "Coordinates in box";

// Custom filter for coordinates within a radius in km.
export function coordinatesWithinRadius(rows, id, filterValue) {
  const [latCentre, lonCentre, distance] = filterValue;

  const dist = (lat1, lon1, lat2, lon2) => {
    // Compute distance between two lat-lon points using haversine formula.
    // Courtesy of http://www.movable-type.co.uk/scripts/latlong.html .
    // Cool new thing: Many non-ascii characters are legit in JS identifiers!
    const R = 6371; // km
    const d2R = Math.PI / 180;
    const φ1 = lat1 * d2R;
    const φ2 = lat2 * d2R;
    const Δφ = (lat2 - lat1) * d2R;
    const Δλ = (lon2 - lon1) * d2R;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return rows.filter((row) => {
    // We don't want to auto-remove the filter if a single value is transiently
    // undefined. So we do this filtering instead.
    if (!latCentre || !lonCentre || !distance) {
      return true;
    }
    const [latitude, longitude] = row.values[id];
    return dist(latCentre, lonCentre, latitude, longitude) < distance;
  });
}
coordinatesWithinRadius.autoRemove = (val) =>
  !val ||
  (typeof val[0] !== "number" &&
    typeof val[1] !== "number" &&
    typeof val[2] !== "number");
coordinatesWithinRadius.filterName = "Coordinates within radius";

// Value for React Table filterTypes argument (must be memoized).
export const filterTypes = {
  textStartsWith,
  includesIfDefined,
  includesInArrayOfString,
  includesSubstringInArrayOfString,
  exactOrAllAsterisk,
  coordinatesInBox,
  coordinatesWithinRadius,
};

export function filterName(id) {
  return filterTypes[id]?.filterName || id || "Contains";
}
