import Color from 'colorjs.io'
import { generateConfusionLines, isPointInImage } from '../utils'
import type { Point } from '../types'
import * as brettel from '../simulations/brettel'
import * as shapes from '../shapes'

type Transform = (p: Point) => Point

type DeficiencyType =
  | 'normal'
  | 'protanopia'
  | 'protanomaly'
  | 'deuteranopia'
  | 'deuteranomaly'
  | 'tritanopia'
  | 'tritanomaly'
  | 'achromatopsia'
  | 'achromatomaly'

export default class IshiharaPlate {
  private width: number
  private height: number
  private imageData: ImageData | null = null

  // Insertion order matters here, as it will determine the order in which transforms are applied
  private transforms: Map<'color' | 'filter', Transform | null> = new Map([
    ['color', null],
    ['filter', null],
  ])

  private _dots: Point[] = []

  public get dots() {
    return this._dots
  }

  public set dots(dots: Point[]) {
    this._dots = dots.map((point) => ({ ...point }))
  }

  constructor(width: number, height: number, dots: Point[] = []) {
    this.width = width
    this.height = height
    this.dots = dots
  }

  public simulateColorBlindness(type: DeficiencyType) {
    this.transforms.set('filter', (point) => {
      const color = new Color(point.color ?? '#000000').to('srgb')
      let transform = brettel.normal

      switch (type) {
        case 'protanopia':
        case 'protanomaly':
        case 'deuteranopia':
        case 'deuteranomaly':
        case 'tritanopia':
        case 'tritanomaly':
          transform = brettel[type]
          break

        case 'achromatopsia':
        case 'achromatomaly':
          break
      }

      color.coords = transform(color.coords)

      return {
        ...point,
        color: color.toString({ space: 'srgb' }),
      }
    })
  }

  public setColors(mode: 'deutan' | 'tritan' | 'protan') {
    const confusionLines = generateConfusionLines(mode)
    const i = Math.round(Math.random() * (confusionLines.length - 1))
    const randomConfusionLine = confusionLines[i]

    const generatedColors = new Map<number, [string, string]>()

    this.transforms.set('color', (point) => {
      const [onColor, offColor] = generatedColors.get(point.id) ?? [
        randomConfusionLine(Math.random() * 0.5).toString(),
        randomConfusionLine(0.5 + Math.random() * 0.5).toString(),
      ]

      generatedColors.set(point.id, [onColor, offColor])

      return {
        ...point,
        color:
          this.imageData && isPointInImage(this.imageData, point)
            ? onColor
            : offColor,
      }
    })
  }

  public addShape(shape: 'circle' | 'square' | 'triangle') {
    const image = shapes[shape]
    const ratio = Math.min(this.width / image.width, this.height / image.height)
    const scaledImageWidth = image.width * ratio
    const scaledImageHeight = image.height * ratio

    const imageCanvas = new OffscreenCanvas(image.width, image.height)
    const plateCanvas = new OffscreenCanvas(this.width, this.height)
    const imageContext = imageCanvas.getContext('2d')!
    const plateContext = plateCanvas.getContext('2d')!

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

    this.imageData = plateContext.getImageData(0, 0, this.width, this.height)
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height)

    this._dots.forEach((p) => {
      let point = { ...p }
      this.transforms.forEach((transform) => {
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
      this.transforms.forEach((transform) => {
        point = transform?.(point) ?? point
      })
      return point
    })
  }
}
