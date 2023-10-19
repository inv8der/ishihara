import Color from 'colorjs.io'
import { CopunctalPoint, RED_XYY, GREEN_XYY, BLUE_XYY } from './constants'
import type { Vector2D, Vector3D, Point } from './types'

type ColorRange = (percentage: number) => string

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function round(x: number, digits = 0): number {
  // See https://expertcodeblog.wordpress.com/2018/02/12/typescript-javascript-round-number-by-decimal-pecision
  return Number(Math.round(Number(`${x}e${digits}`)) + `e-${digits}`)
}

export function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max)
}

export function dotProduct(a: Vector3D, b: Vector3D): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function barycentric(
  coords: Vector2D,
  triangle: [Vector2D, Vector2D, Vector2D]
): Vector3D {
  const [x1, y1] = triangle[0]
  const [x2, y2] = triangle[1]
  const [x3, y3] = triangle[2]

  const d = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3)
  const b1 = ((y2 - y3) * (coords[0] - x3) + (x3 - x2) * (coords[1] - y3)) / d
  const b2 = ((y3 - y1) * (coords[0] - x3) + (x1 - x3) * (coords[1] - y3)) / d
  const b3 = 1 - b1 - b2

  return [b1, b2, b3]
}

export function XYtoXYZ([x, y]: Vector2D): Vector3D {
  const rgbGamut: [Vector2D, Vector2D, Vector2D] = [
    [RED_XYY[0], RED_XYY[1]],
    [GREEN_XYY[0], GREEN_XYY[1]],
    [BLUE_XYY[0], BLUE_XYY[1]],
  ]

  const B = barycentric([x, y], rgbGamut)
  const Y = dotProduct(B, [RED_XYY[2], GREEN_XYY[2], BLUE_XYY[2]])
  const X = (Y * x) / y
  const Z = (Y * (1 - x - y)) / y

  return [X, Y, Z]
}

export function XYZtoXY([X, Y, Z]: Vector3D): Vector2D {
  const x = X / (X + Y + Z)
  const y = Y / (X + Y + Z)

  return [x, y]
}

export function findIntersection(
  line1: [Vector2D, Vector2D],
  line2: [Vector2D, Vector2D]
): Vector2D {
  const m1 = (line1[0][1] - line1[1][1]) / (line1[0][0] - line1[1][0])
  const m2 = (line2[0][1] - line2[1][1]) / (line2[0][0] - line2[1][0])
  const x =
    (m1 * line1[0][0] - m2 * line2[0][0] - line1[0][1] + line2[0][1]) /
    (m1 - m2)
  const y = m1 * (x - line1[0][0]) + line1[0][1]

  return [x, y]
}

export function generateConfusionLines(
  type: 'deutan' | 'protan' | 'tritan'
): ColorRange[] {
  const red = new Color('#ff0000').to('xyz')
  const green = new Color('#00ff00').to('xyz')
  const blue = new Color('#0000ff').to('xyz')

  const interpolationSpace = 'srgb-linear'
  const redXY = XYZtoXY(red.coords)
  const blueXY = XYZtoXY(blue.coords)

  let bounds
  let startColorRange
  let createConfusionLine

  switch (type) {
    case 'deutan': {
      bounds = [0.2, 1]
      startColorRange = blue.range(green, { space: interpolationSpace })
      createConfusionLine = (color: Color) => {
        const colorXY = XYZtoXY(color.to('xyz').coords)
        const [x, y] = findIntersection(
          [blueXY, redXY],
          [colorXY, CopunctalPoint.DEUTAN]
        )
        const colorRange = color.range(new Color('xyz', XYtoXYZ([x, y])), {
          space: interpolationSpace,
        })
        return (percentage: number): string =>
          colorRange(percentage).to('srgb').toString()
      }
      break
    }

    case 'protan': {
      bounds = [0.15, 1]
      startColorRange = blue.range(green, { space: interpolationSpace })
      createConfusionLine = (color: Color) => {
        const colorXY = XYZtoXY(color.to('xyz').coords)
        const [x, y] = findIntersection(
          [blueXY, redXY],
          [colorXY, CopunctalPoint.PROTAN]
        )
        const colorRange = color.range(new Color('xyz', XYtoXYZ([x, y])), {
          space: interpolationSpace,
        })
        return (percentage: number): string =>
          colorRange(percentage).to('srgb').toString()
      }
      break
    }

    case 'tritan': {
      bounds = [0, 0.9]
      startColorRange = green.range(red, { space: interpolationSpace })
      createConfusionLine = (color: Color) => {
        const colorXY = XYZtoXY(color.to('xyz').coords)
        const [x, y] = findIntersection(
          [blueXY, redXY],
          [colorXY, CopunctalPoint.TRITAN]
        )
        const colorRange = color.range(new Color('xyz', XYtoXYZ([x, y])), {
          space: interpolationSpace,
        })
        return (percentage: number): string =>
          colorRange(percentage).to('srgb').toString()
      }
      break
    }
  }

  // Assuming bounds of [0, 1] and a step of 0.1, we'll end up with 11 lines
  // as we want to include both the lower and upper bounds
  const numLines = 11
  const confusionLines = []
  const step = round((bounds[1] - bounds[0]) / (numLines - 1), 4)
  let percentage = bounds[0]

  for (let i = 0; i < numLines; i += 1) {
    const startColor = startColorRange(percentage)
    confusionLines.push(createConfusionLine(startColor))
    percentage = Math.min(round(percentage + step, 4), bounds[1])
  }

  return confusionLines
}

export function isPointInImage(image: ImageData, point: Point): boolean {
  for (let i = 0; i <= point.radius; i++) {
    for (let r = 0; r <= point.radius; r++) {
      const x = point.x + Math.cos(i * Math.PI * 2) * r
      const y = point.y + Math.sin(i * Math.PI * 2) * r

      const index = (Math.floor(y) * image.width + Math.floor(x)) * 4

      const red = image.data[index]
      const green = image.data[index + 1]
      const blue = image.data[index + 2]
      const alpha = image.data[index + 3]

      if ((red + green + blue) * (alpha / 255) < 127) {
        return true
      }
    }
  }

  return false
}
