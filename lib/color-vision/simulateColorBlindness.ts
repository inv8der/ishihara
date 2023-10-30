import Color from 'colorjs.io'
import math from '../math'
import type { ColorCoords } from '../types'
import brettel from './simulations/brettel'

export default function simulateColorBlindness(
  rgb: ColorCoords,
  deficiency: 'deutan' | 'protan' | 'tritan',
  severity: number
): ColorCoords
export default function simulateColorBlindness(
  rgb: string,
  deficiency: 'deutan' | 'protan' | 'tritan',
  severity: number
): string
export default function simulateColorBlindness(
  rgb: string | ColorCoords,
  deficiency: 'deutan' | 'protan' | 'tritan',
  severity: number
): string | ColorCoords {
  severity = math.clip(severity, 0, 1)

  if (typeof rgb === 'string') {
    const c = new Color(rgb).to('srgb')
    c.coords = brettel(c.coords, deficiency, severity)
    return c.toString({ format: 'hex' })
  }

  return brettel(rgb, deficiency, severity)
}
