import type { Vector2D, Vector3D } from './types'

// Values for deutan copunctal points differs between these sources
// https://www.researchgate.net/figure/Copunctal-points-of-dichromate-confusion-lines_tbl1_228970453
// https://rdrr.io/cran/CVD/man/dichromaticCopunctalPoints.html

// Enum-like object that defines the copunctal points of the different color vision deficiencies.
// TypeScript doesn't allow enum values other than number and string
export const CopunctalPoint: Record<'DEUTAN' | 'PROTAN' | 'TRITAN', Vector2D> =
  {
    DEUTAN: [1.4, -0.4],
    PROTAN: [0.7465, 0.2535],
    TRITAN: [0.1748, 0],
  }

// Red, green, and blue in the xyY color space - source: https://en.wikipedia.org/wiki/SRGB
export const RED_XYY: Vector3D = [0.64, 0.33, 0.2126]
export const BLUE_XYY: Vector3D = [0.3, 0.6, 0.7152]
export const GREEN_XYY: Vector3D = [0.15, 0.06, 0.0722]
