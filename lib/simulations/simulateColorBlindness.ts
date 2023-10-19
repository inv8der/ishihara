import Color from 'colorjs.io'
import { clamp } from '../utils'
import brettel from './brettel'

export default function simulateColorBlindness(
  color: string | Color,
  type: 'deutan' | 'protan' | 'tritan',
  severity: number
): Color {
  const c = new Color(color).to('srgb')
  c.coords = brettel(c.coords, type, clamp(severity, 0, 1))
  return c
}
