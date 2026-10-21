export const utcDateOnly = (d) => {
  // Return a new Date object which is suitable for comparing UTC date only
  // (fixed zero time component). One might suppose that the comparisons in
  // the filter below also would work with local time (Date.setHours()), but
  // they don't; only UTC works.
  if (!d) {
    return d;
  }
  // Observation timestamps without a timezone represent UTC. Native Date
  // parsing would interpret them in the browser's local timezone instead.
  const value =
    typeof d === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(d)
      ? `${d}Z`
      : d;
  const r = new Date(value);
  r.setUTCHours(0, 0, 0, 0);
  return r;
};
