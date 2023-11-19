import Color from 'colorjs.io'
import math from '../math'
import { generateConfusionLines, simulateColorBlindness } from '../color-vision'
import type { Point, Deficiency, Shape } from '../types'
import * as shapes from '../shapes'

type Transform = (p: Point) => Point

export default class IshiharaPlate {
  private _width: number
  private _height: number
  private _dots: Point[] = []
  private _imageData: ImageData | null = null
  private _pointInShape: Map<string, boolean> = new Map()

  // Insertion order matters here, as it will determine the order in which transforms are applied
  private _transforms = new Map<'color' | 'filter', Transform | null>([
    ['color', null],
    ['filter', null],
  ])

  constructor(width: number, height: number, dots: Point[] = []) {
    this._width = width
    this._height = height
    this.dots = dots
  }

  get width() {
    return this._width
  }

  get height() {
    return this._height
  }

  get dots() {
    return this._dots
  }

  set dots(dots: Point[]) {
    this._dots = dots.map((point) => ({ ...point }))
  }

  private _isPointInImage(point: Point): boolean {
    const image = this._imageData

    if (!image) {
      return false
    }

    if (this._pointInShape.has(point.id)) {
      return this._pointInShape.get(point.id) ?? false
    }

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
          this._pointInShape.set(point.id, true)
          return true
        }
      }
    }

    this._pointInShape.set(point.id, false)
    return false
  }

  simulateColorBlindness(enabled: false): void
  simulateColorBlindness(type: Deficiency, severity?: number): void
  simulateColorBlindness(type: false | Deficiency, severity?: number): void {
    if (type === false) {
      this._transforms.set('filter', null)
    } else {
      this._transforms.set('filter', (point) => {
        const color = new Color(point.color ?? '#000000').to('srgb')
        color.coords = simulateColorBlindness(color.coords, type, severity ?? 1)

        return {
          ...point,
          color: color.toString({ format: 'hex' }),
        }
      })
    }
  }

  setColors(mode: Deficiency) {
    const confusionLines = generateConfusionLines(mode)
    // Generates a random integer between 0 (inclusive) and confusionLines.length (exclusive)
    const i = math.randomInt(0, confusionLines.length)
    const randomConfusionLine = confusionLines[i]

    const generatedColors = new Map<string, [string, string]>()

    this._transforms.set('color', (point) => {
      const [onColor, offColor] = generatedColors.get(point.id) ?? [
        randomConfusionLine(0.8 + Math.random() * 0.2),
        randomConfusionLine(0 + Math.random() * 0.2),
      ]

      generatedColors.set(point.id, [onColor, offColor])

      return {
        ...point,
        color: this._isPointInImage(point) ? onColor : offColor,
      }
    })
  }

  addShape(shape: Shape) {
    const image = shapes[shape]
    const ratio = Math.min(this.width / image.width, this.height / image.height)
    const scaledImageWidth = image.width * ratio
    const scaledImageHeight = image.height * ratio

    const imageCanvas = new OffscreenCanvas(image.width, image.height)
    const plateCanvas = new OffscreenCanvas(this.width, this.height)
    const imageContext = imageCanvas.getContext('2d')
    const plateContext = plateCanvas.getContext('2d')

    if (imageContext && plateContext) {
      imageContext.putImageData(image, 0, 0)

      plateContext.fillStyle = '#ffffff'
      plateContext.fillRect(0, 0, this.width, this.height)
      plateContext.drawImage(
        imageCanvas,
        (this.width - scaledImageWidth) / 2,
        (this.height - scaledImageHeight) / 2,
        scaledImageWidth,
        scaledImageHeight
      )

      this._imageData = plateContext.getImageData(0, 0, this.width, this.height)
      this._pointInShape.clear()
    }
  }

  reset() {
    this._transforms.set('color', null)
    this._transforms.set('filter', null)
    this._imageData = null
    this._pointInShape.clear()
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height)

    this._dots.forEach((p) => {
      let point = { ...p }
      this._transforms.forEach((transform) => {
        point = transform?.(point) ?? point
      })

      ctx.beginPath()
      ctx.arc(point.x, point.y, point.radius, 0, 2 * Math.PI)
      ctx.fillStyle = point.color ?? '#000000'
      ctx.fill()
      ctx.closePath()
    })
  }

  public paintDots(): Point[] {
    return this._dots.map((p) => {
      let point = { ...p }
      this._transforms.forEach((transform) => {
        point = transform?.(point) ?? point
      })
      return point
    })
  }
}
