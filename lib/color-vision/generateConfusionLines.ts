import Color from 'colorjs.io'
import math from '../math'
import type { Vector3D, ColorCoords, Deficiency } from '../types'
import { Parallelepiped, Line, Point, Vector, intersection } from '../geo3d'
import { colorSpaceConverter, toHexString, LMSModel } from './convert'

type ColorRange = (percentage: number) => string

const convert = colorSpaceConverter(LMSModel.SmithPokorny75)

/**
 * Return the endpoints of the confusion line passing by the given LMS point.
 * The line is parallel to the dichromat missing axis, and the segment is the intersection
 * of that line with the RGB gamut in the LMS space.
 *
 * @param lms Coordinate of a color through which the confusion line should pass in the LMS space
 * @param deficiency One of Deficiency.PROTAN, DEUTAN or TRITAN to determine the confusion axis in LMS
 * @returns The points corresponding to the start and end of the line segment.
 */
function lmsConfusionSegment(lms: ColorCoords, deficiency: Deficiency) {
  // First we build the linear RGB gamut (cube) in LMS. It becomes a parallelepiped since it's a linear transform.
  const lms_K = convert([0, 0, 0], 'linear-rgb', 'lms')
  const lms_R = convert([1, 0, 0], 'linear-rgb', 'lms')
  const lms_G = convert([0, 1, 0], 'linear-rgb', 'lms')
  const lms_B = convert([0, 0, 1], 'linear-rgb', 'lms')

  const base = math.flatten(lms_K) as Vector3D
  const v1 = math.flatten(math.subtract(lms_R, lms_K)) as Vector3D
  const v2 = math.flatten(math.subtract(lms_G, lms_K)) as Vector3D
  const v3 = math.flatten(math.subtract(lms_B, lms_K)) as Vector3D

  // The parallelogram is defined by the origin (black) and the 3 vectors.
  const rgbGamut = new Parallelepiped(
    new Point(...base),
    new Vector(v1),
    new Vector(v2),
    new Vector(v3)
  )

  // Determine LMS axis along which a dichromat will confuse the colors.
  let confusionAxis: Vector3D
  switch (deficiency) {
    case 'protan':
      confusionAxis = [1.0, 0.0, 0.0]
      break
    case 'deutan':
      confusionAxis = [0.0, 1.0, 0.0]
      break
    case 'tritan':
      confusionAxis = [0.0, 0.0, 1.0]
      break
  }

  //  Now we build the confusion line passing through the given point.
  const line = new Line(
    new Point(lms),
    new Vector(math.add(lms, confusionAxis))
  )

  // The intersection with the parallelepiped is our segment.
  const segment = intersection(line, rgbGamut)

  // It can be null if the provided color was not inside the parallelogram.
  if (segment === null || segment instanceof Point) {
    throw new Error('The provided color is not in the RGB gamut.')
  }

  const start = segment.start.vector
  const end = segment.end.vector

  return start.length() < end.length()
    ? [start.toArray(), end.toArray()]
    : [end.toArray(), start.toArray()]
}

function createConfusionLine(rgb: ColorCoords, anomaly: Deficiency) {
  /**
   * This returns a line segment along the anomaly projection axis (L, M or S)
   * that passes through the input LMS color and stops at the boundaries of the
   * gamut (the parallelepiped). Then we can walk along that segment with small
   * steps to generate confusion colors.
   */
  const lms = convert(rgb, 'srgb', 'lms')
  const segment = lmsConfusionSegment(lms, anomaly)

  return (percentage: number) => {
    const lms = math.add(
      math.multiply(segment[0], 1.0 - percentage),
      math.multiply(segment[1], percentage)
    ) as ColorCoords

    return toHexString(convert(lms, 'lms', 'srgb'))
  }
}

export default function generateConfusionLines(
  type: Deficiency,
  amount = 11
): ColorRange[] {
  const red = new Color('#ff0000').to('xyz')
  const green = new Color('#00ff00').to('xyz')
  const blue = new Color('#0000ff').to('xyz')
  const interpolationSpace = 'xyz'

  let bounds
  let startColorRange

  switch (type) {
    case 'deutan': {
      bounds = [0.2, 1]
      startColorRange = blue.range(green, { space: interpolationSpace })
      break
    }

    case 'protan': {
      bounds = [0.15, 0.98]
      startColorRange = blue.range(green, { space: interpolationSpace })
      break
    }

    case 'tritan': {
      bounds = [0.1, 0.9]
      startColorRange = green.range(red, { space: interpolationSpace })
      break
    }
  }

  // Assuming a bounds of [0, 1] and step of 0.1, we should end up with 11 lines
  // since both the lower and upper bounds are included. Therefore, to calculate
  // step we need divide by amount - 1, which in this example is 10
  const confusionLines = []
  const step = math.round((bounds[1] - bounds[0]) / (amount - 1), 4)
  let percentage = bounds[0]

  for (let i = 0; i < amount; i += 1) {
    const startColor = startColorRange(percentage)
    const rgb = startColor.to('srgb').coords
    confusionLines.push(createConfusionLine(rgb, type))
    percentage = math.min(math.round(percentage + step, 4), bounds[1])
  }

  return confusionLines
}
