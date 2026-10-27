export const textAttributeIds = new Set([
  "Native ID",
  "Station name",
  "Unique Names",
]);

// Keep punctuation literal. A comma in a station name is not a separator.
export function textFilterTerms(value) {
  const seen = new Set();
  return (Array.isArray(value) ? value : [value]).flatMap((item) => {
    if (typeof item !== "string") return [];
    const term = item.trim();
    const key = term.toLowerCase();
    if (!term || seen.has(key)) return [];
    seen.add(key);
    return [term];
  });
}
