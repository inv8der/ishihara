import type { Vector2D } from "./types"

// Values for deutan copunctal points differs between these sources
// https://www.color-blindness.com/2009/01/19/colorblind-colors-of-confusion
// https://www.researchgate.net/figure/Copunctal-points-of-dichromate-confusion-lines_tbl1_228970453

// Enum-like object that defines the copunctal points of the different color vision deficiencies.
// TypeScript doesn't allow enum values other than number and string
export const CopunctalPoint: Record<"DEUTAN" | "PROTAN" | "TRITAN", Vector2D> =
  {
    DEUTAN: [1.08, -0.8],
    PROTAN: [0.747, 0.253],
    TRITAN: [0.171, 0],
  }
