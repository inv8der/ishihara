import math from '../math'
import type { ColorCoords } from '../types'

interface ModelParams {
  lmsFromXyz: number[][]
  xyzFromLinearRgb: number[][]
}

export class LMSModel {
  static SmithPokorny75 = new LMSModel({
    lmsFromXyz: [
      [0.15514, 0.54312, -0.03286],
      [-0.15514, 0.45684, 0.03286],
      [0, 0, 0.01608],
    ],
    xyzFromLinearRgb: [
      [0.409568, 0.355041, 0.179167],
      [0.213389, 0.706743, 0.079868],
      [0.0186297, 0.11462, 0.912367],
    ],
  })

  static HuntPointerEstevez = new LMSModel({
    lmsFromXyz: [
      [0.4002, 0.7076, -0.0808],
      [-0.2263, 1.1653, 0.0457],
      [0, 0, 0.9182],
    ],
    xyzFromLinearRgb: [
      [0.412456, 0.3575761, 0.1804375],
      [0.212672, 0.7151522, 0.072175],
      [0.019333, 0.119192, 0.9503041],
    ],
  })

  public lmsFromXyz: number[][]
  public xyzFromLms: number[][]
  public lmsFromLinearRgb: number[][]
  public linearRgbFromLms: number[][]

  constructor({ lmsFromXyz, xyzFromLinearRgb }: ModelParams) {
    this.lmsFromXyz = lmsFromXyz
    this.xyzFromLms = math.inv(this.lmsFromXyz)
    this.lmsFromLinearRgb = math.multiply(this.lmsFromXyz, xyzFromLinearRgb)
    this.linearRgbFromLms = math.inv(this.lmsFromLinearRgb)
  }
}

type ColorSpaceId = 'lms' | 'srgb' | 'linear-rgb'

export function colorSpaceConverter(lmsModel: LMSModel) {
  return function convert(
    color: ColorCoords,
    from: ColorSpaceId,
    to: ColorSpaceId
  ): ColorCoords {
    if (from === 'lms') {
      switch (to) {
        case 'lms': {
          return [...color]
        }
        case 'srgb': {
          const linearRgb = convert(color, 'lms', 'linear-rgb')
          return convert(linearRgb, 'linear-rgb', 'srgb')
        }
        case 'linear-rgb': {
          const linearRgb = math.multiply(lmsModel.linearRgbFromLms, color)

          // Make the RGB colors fit in the [0,1] range by desaturating. Instead of just clipping,
          // we move the color towards the white point, desaturating it until it fits the gamut.
          const min = math.min(0, ...linearRgb)
          return linearRgb.map((value) =>
            math.clip(value - min, 0, 1)
          ) as ColorCoords
        }
      }
    }

    if (from === 'srgb') {
      switch (to) {
        case 'lms': {
          const linearRgb = convert(color, 'srgb', 'linear-rgb')
          return math.multiply(
            lmsModel.lmsFromLinearRgb,
            linearRgb
          ) as ColorCoords
        }
        case 'srgb': {
          return [...color]
        }
        case 'linear-rgb': {
          // Convert sRGB to linearRGB, removing the gamma correction.
          // Formula taken from Wikipedia https://en.wikipedia.org/wiki/SRGB
          return color.map((v) => {
            return v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92
          }) as ColorCoords
        }
      }
    }

    if (from === 'linear-rgb') {
      switch (to) {
        case 'lms': {
          return math.multiply(lmsModel.lmsFromLinearRgb, color) as ColorCoords
        }
        case 'srgb': {
          // Convert linearRGB to sRGB, applying the gamma correction.
          // Formula taken from Wikipedia https://en.wikipedia.org/wiki/SRGB
          return color.map((value) =>
            value > 0.0031308
              ? value ** (1 / 2.4) * 1.055 - 0.055
              : value * 12.92
          ) as ColorCoords
        }
        case 'linear-rgb': {
          return [...color]
        }
      }
    }

    return color
  }
}

export function toHexString(rgb: ColorCoords): string {
  const hex = rgb.map((value) => {
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0')
  })
  return `#${hex.join('')}`
}
