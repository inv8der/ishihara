import Color from "colorjs.io"
import { CopunctalPoint } from "./constants"
import type { Vector2D, Vector3D } from "./types"

export function dotProduct(a: Vector3D, b: Vector3D): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function barycentric(
  coords: Vector2D,
  triangle: [Vector2D, Vector2D, Vector2D],
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
  // Red, green, and blue in the xyY color space - source: https://en.wikipedia.org/wiki/SRGB
  const red = [0.64, 0.33, 0.2126]
  const green = [0.3, 0.6, 0.7152]
  const blue = [0.15, 0.06, 0.0722]

  const rgbGamut: [Vector2D, Vector2D, Vector2D] = [
    [red[0], red[1]],
    [green[0], green[1]],
    [blue[0], blue[1]],
  ]

  const B = barycentric([x, y], rgbGamut)
  const Y = dotProduct(B, [red[2], green[2], blue[2]])
  const X = (Y * x) / y
  const Z = (Y * (1 - x - y)) / y

  return [X, Y, Z]
}

export function XYZtoXY([X, Y, Z]: Vector3D): Vector2D {
  var x = X / (X + Y + Z)
  var y = Y / (X + Y + Z)

  return [x, y]
}

// function linearRGB_from_sRGB(v) {
//   var fv = v / 255.0
//   if (fv < 0.04045) return fv / 12.92
//   return Math.pow((fv + 0.055) / 1.055, 2.4)
// }

// function sRGB_from_linearRGB(v) {
//   if (v <= 0) return 0
//   if (v >= 1) return 255
//   if (v < 0.0031308) return 0.5 + v * 12.92 * 255
//   return 0 + 255 * (Math.pow(v, 1.0 / 2.4) * 1.055 - 0.055)
// }

export function findIntersection(
  line1: [Vector2D, Vector2D],
  line2: [Vector2D, Vector2D],
): Vector2D {
  const m1 = (line1[0][1] - line1[1][1]) / (line1[0][0] - line1[1][0])
  const m2 = (line2[0][1] - line2[1][1]) / (line2[0][0] - line2[1][0])
  const x =
    (m2 * line2[0][0] - m1 * line1[1][0] + line1[1][1] - line2[0][1]) /
    (m2 - m1)
  const y = m2 * (x - line2[0][0]) + line2[0][1]

  return [x, y]
}

export function generateConfusionLines(type: "deutan" | "protan" | "tritan") {
  const red = new Color("#ff0000").to("xyz")
  const green = new Color("#00ff00").to("xyz")
  const blue = new Color("#0000ff").to("xyz")

  const redXY = XYZtoXY(red.coords)
  const greenXY = XYZtoXY(green.coords)
  const blueXY = XYZtoXY(blue.coords)

  let startColorRange
  let createConfusionLine

  switch (type) {
    case "deutan": {
      startColorRange = blue.range(green, { space: "xyz" })
      createConfusionLine = (color: Color) => {
        const colorXY = XYZtoXY(color.to("xyz").coords)
        const [x, y] = findIntersection(
          [blueXY, redXY],
          [colorXY, CopunctalPoint.DEUTAN],
        )
        return color.range(new Color("xyz", XYtoXYZ([x, y])), {
          space: "xyz",
        })
      }
      break
    }

    case "protan": {
      startColorRange = blue.range(green, { space: "xyz" })
      createConfusionLine = (color: Color) => {
        const colorXY = XYZtoXY(color.to("xyz").coords)
        const [x, y] = findIntersection(
          [blueXY, redXY],
          [colorXY, CopunctalPoint.PROTAN],
        )
        return color.range(new Color("xyz", XYtoXYZ([x, y])), {
          space: "xyz",
        })
      }
      break
    }

    case "tritan": {
      startColorRange = green.range(red, { space: "xyz" })
      createConfusionLine = (color: Color) => {
        const colorXY = XYZtoXY(color.to("xyz").coords)
        const [x, y] = findIntersection(
          [blueXY, redXY],
          [colorXY, CopunctalPoint.TRITAN],
        )
        return color.range(new Color("xyz", XYtoXYZ([x, y])), {
          space: "xyz",
        })
      }
      break
    }
  }

  const confusionLines = []
  const bounds = [0.15, 0.85]
  const step = (bounds[1] - bounds[0]) / 10
  let percentage = bounds[0]

  while (percentage <= bounds[1]) {
    const startColor = startColorRange(percentage)
    confusionLines.push(createConfusionLine(startColor))
    percentage += step
  }

  return confusionLines
}

export async function loadImageData(url: string): Promise<ImageData> {
  const image = new Image()
  image.src = url

  await image.decode()

  const canvas = new OffscreenCanvas(image.width, image.height)
  const context = canvas.getContext("2d")!
  context.drawImage(image, 0, 0, image.width, image.height)

  return context.getImageData(0, 0, image.width, image.height)
}
