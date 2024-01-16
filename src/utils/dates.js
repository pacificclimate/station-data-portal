export const utcDateOnly = (d) => {
  // Return a new Date object which is suitable for comparing UTC date only
  // (fixed zero time component). One might suppose that the comparisons in
  // the filter below also would work with local time (Date.setHours()), but
  // they don't; only UTC works.
  if (!d) {
    return d;
  }
  const r = new Date(d);
  r.setUTCHours(0, 0, 0, 0);
  return r;
};
