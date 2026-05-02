/**
 * Title-style casing for person and dog display names (whitespace, hyphens, apostrophes).
 */
function capitalizeSegment(segment: string): string {
  if (!segment) return segment;
  return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
}

export function capitalizePersonOrDogName(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  return trimmed
    .split(/\s+/)
    .map((word) =>
      word
        .split("-")
        .map((hyphenPart) => hyphenPart.split("'").map(capitalizeSegment).join("'"))
        .join("-"),
    )
    .join(" ");
}

