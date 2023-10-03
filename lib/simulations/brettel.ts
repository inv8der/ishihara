import Color from "colorjs.io"
import { dotProduct } from "../utils"
import type { Vector3D } from "../types"

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

type BrettelParams = {
  projection1: [Vector3D, Vector3D, Vector3D]
  projection2: [Vector3D, Vector3D, Vector3D]
  separationPlaneNormal: Vector3D
}

type ColorCoords = [number, number, number]

type ColorTransform = (rgb: string | ColorCoords) => ColorCoords

// https://github.com/DaltonLens/libDaltonLens
const brettelParamsByType: Record<
  "protan" | "deutan" | "tritan",
  BrettelParams
> = {
  protan: {
    projection1: [
      [0.1451, 1.20165, -0.34675],
      [0.10447, 0.85316, 0.04237],
      [0.00429, -0.00603, 1.00174],
    ],
    projection2: [
      [0.14115, 1.16782, -0.30897],
      [0.10495, 0.8573, 0.03776],
      [0.00431, -0.00586, 1.00155],
    ],
    separationPlaneNormal: [0.00048, 0.00416, -0.00464],
  },

  deutan: {
    projection1: [
      [0.36198, 0.86755, -0.22953],
      [0.26099, 0.64512, 0.09389],
      [-0.01975, 0.02686, 0.99289],
    ],
    projection2: [
      [0.37009, 0.8854, -0.25549],
      [0.25767, 0.63782, 0.10451],
      [-0.0195, 0.02741, 0.99209],
    ],
    separationPlaneNormal: [-0.00293, -0.00645, 0.00938],
  },

  tritan: {
    projection1: [
      [1.01354, 0.14268, -0.15622],
      [-0.01181, 0.87561, 0.13619],
      [0.07707, 0.81208, 0.11085],
    ],
    projection2: [
      [0.93337, 0.19999, -0.13336],
      [0.05809, 0.82565, 0.11626],
      [-0.37923, 1.13825, 0.24098],
    ],
    separationPlaneNormal: [0.0396, -0.02831, -0.01129],
  },
}

function toColor(rgb: string | ColorCoords): Color {
  return typeof rgb === "string"
    ? new Color(rgb).to("srgb")
    : new Color("srgb", rgb)
}

function brettel(
  rgb: string | ColorCoords,
  type: "protan" | "deutan" | "tritan",
  severity: number,
) {
  // Go from sRGB to linearRGB
  const color = toColor(rgb)
  const linearRGB = color.to("srgb-linear").coords

  // Check on which plane we should project by comparing wih the separation plane normal.
  const { separationPlaneNormal, projection1, projection2 } =
    brettelParamsByType[type]
  const projection =
    dotProduct(linearRGB, separationPlaneNormal) >= 0
      ? projection1
      : projection2

  // Transform to the full dichromat projection plane.
  const simulatedColor = new Color("srgb-linear", [0, 0, 0])

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

  // Go back to sRGB
  return simulatedColor.to("srgb").coords
}

export const normal: ColorTransform = (rgb) => toColor(rgb).coords
export const protanopia: ColorTransform = (rgb) => brettel(rgb, "protan", 1.0)
export const protanomaly: ColorTransform = (rgb) => brettel(rgb, "protan", 0.6)
export const deuteranopia: ColorTransform = (rgb) => brettel(rgb, "deutan", 1.0)
export const deuteranomaly: ColorTransform = (rgb) =>
  brettel(rgb, "deutan", 0.6)
export const tritanopia: ColorTransform = (rgb) => brettel(rgb, "tritan", 1.0)
export const tritanomaly: ColorTransform = (rgb) => brettel(rgb, "tritan", 0.6)
