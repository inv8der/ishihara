import Color from 'colorjs.io'
import { clamp } from '../utils'
import brettel from './brettel'

export default function simulateColorBlindness(
  color: string,
  type: 'deutan' | 'protan' | 'tritan',
  severity: number
): string {
  const c = new Color(color).to('srgb')
  c.coords = brettel(c.coords, type, clamp(severity, 0, 1))
  return c.toString()
}
