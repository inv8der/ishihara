import Color from 'colorjs.io'
import { clamp, dotProduct } from '../utils'
import type { Vector3D } from '../types'

// const simulations = {
//   normal: (v) => v,
//   protanopia: (v) => brettel(v, "protan", 1.0),
//   protanomaly: (v) => brettel(v, "protan", 0.6),
//   deuteranopia: (v) => brettel(v, "deutan", 1.0),
//   deuteranomaly: (v) => brettel(v, "deutan", 0.6),
//   tritanopia: (v) => brettel(v, "tritan", 1.0),
//   tritanomaly: (v) => brettel(v, "tritan", 0.6),
//   achromatopsia: (v) => monochrome_with_severity(v, 1.0),
//   achromatomaly: (v) => monochrome_with_severity(v, 0.6),
// }

interface BrettelParams {
  projection1: [Vector3D, Vector3D, Vector3D]
  projection2: [Vector3D, Vector3D, Vector3D]
  separationPlaneNormal: Vector3D
}

type ColorCoords = [number, number, number]

// https://github.com/DaltonLens/libDaltonLens
const brettelParamsByType: Record<
  'protan' | 'deutan' | 'tritan',
  BrettelParams
> = {
  protan: {
    projection1: [
      [0.1498, 1.19548, -0.34528],
      [0.10764, 0.84864, 0.04372],
      [0.00384, -0.0054, 1.00156],
    ],
    projection2: [
      [0.1457, 1.16172, -0.30742],
      [0.10816, 0.85291, 0.03892],
      [0.00386, -0.00524, 1.00139],
    ],
    separationPlaneNormal: [0.00048, 0.00393, -0.00441],
  },

  deutan: {
    projection1: [
      [0.36477, 0.86381, -0.22858],
      [0.26294, 0.64245, 0.09462],
      [-0.02006, 0.02728, 0.99278],
    ],
    projection2: [
      [0.37298, 0.88166, -0.25464],
      [0.25954, 0.63506, 0.1054],
      [-0.0198, 0.02784, 0.99196],
    ],
    separationPlaneNormal: [-0.00281, -0.00611, 0.00892],
  },

  tritan: {
    projection1: [
      [1.01277, 0.13548, -0.14826],
      [-0.01243, 0.86812, 0.14431],
      [0.07589, 0.805, 0.11911],
    ],
    projection2: [
      [0.93678, 0.18979, -0.12657],
      [0.06154, 0.81526, 0.1232],
      [-0.37562, 1.12767, 0.24796],
    ],
    separationPlaneNormal: [0.03901, -0.02788, -0.01113],
  },
}

function toColor(rgb: string | ColorCoords): Color {
  return typeof rgb === 'string'
    ? new Color(rgb).to('srgb')
    : new Color('srgb', rgb)
}

function brettel(
  rgb: string | ColorCoords,
  type: 'protan' | 'deutan' | 'tritan',
  severity: number
): ColorCoords {
  // Convert from sRGB to linearRGB
  const color = toColor(rgb)
  const linearRGB = color.to('srgb-linear').coords

  // Check on which plane we should project by comparing wih the separation plane normal.
  const { separationPlaneNormal, projection1, projection2 } =
    brettelParamsByType[type]
  const projection =
    dotProduct(linearRGB, separationPlaneNormal) >= 0
      ? projection1
      : projection2

  // Transform to the full dichromat projection plane.
  const simulatedColor = new Color('srgb-linear', [0, 0, 0])

  simulatedColor.coords[0] =
    projection[0][0] * linearRGB[0] +
    projection[0][1] * linearRGB[1] +
    projection[0][2] * linearRGB[2]

  simulatedColor.coords[1] =
    projection[1][0] * linearRGB[0] +
    projection[1][1] * linearRGB[1] +
    projection[1][2] * linearRGB[2]

  simulatedColor.coords[2] =
    projection[2][0] * linearRGB[0] +
    projection[2][1] * linearRGB[1] +
    projection[2][2] * linearRGB[2]

  // Apply the severity factor as a linear interpolation.
  // It's the same to do it in the RGB space or in the LMS space since it's a linear transform.
  simulatedColor.coords[0] =
    simulatedColor.coords[0] * severity + linearRGB[0] * (1.0 - severity)
  simulatedColor.coords[1] =
    simulatedColor.coords[1] * severity + linearRGB[1] * (1.0 - severity)
  simulatedColor.coords[2] =
    simulatedColor.coords[2] * severity + linearRGB[2] * (1.0 - severity)

  // Convert back to sRGB, clamping any values not in gamut
  return simulatedColor
    .to('srgb')
    .coords.map((v) => clamp(v, 0, 1)) as ColorCoords
}

brettel.normal = (rgb: string | ColorCoords) => toColor(rgb).coords
brettel.protanopia = (rgb: string | ColorCoords) => brettel(rgb, 'protan', 1.0)
brettel.protanomaly = (rgb: string | ColorCoords) => brettel(rgb, 'protan', 0.6)
brettel.deuteranopia = (rgb: string | ColorCoords) =>
  brettel(rgb, 'deutan', 1.0)
brettel.deuteranomaly = (rgb: string | ColorCoords) =>
  brettel(rgb, 'deutan', 0.6)
brettel.tritanopia = (rgb: string | ColorCoords) => brettel(rgb, 'tritan', 1.0)
brettel.tritanomaly = (rgb: string | ColorCoords) => brettel(rgb, 'tritan', 0.6)

export default brettel
