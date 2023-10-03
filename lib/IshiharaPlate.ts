import Color from "colorjs.io"
import { generateConfusionLines } from "./utils"
import type { Point } from "./types"
import * as brettel from "./simulations/brettel"

type ColorDeficiencyType =
  | "normal"
  | "protanopia"
  | "protanomaly"
  | "deuteranopia"
  | "deuteranomaly"
  | "tritanopia"
  | "tritanomaly"
  | "achromatopsia"
  | "achromatomaly"

export default class IshiharaPlate {
  private width: number
  private height: number
  private imageData: ImageData | null = null

  private source: Point[] = []
  private transforms: Map<"color" | "filter", (p: Point) => Point> = new Map()

  public get dots() {
    const transforms = [
      this.transforms.get("color"),
      this.transforms.get("filter"),
    ]

    return this.source.map((p) => {
      let point = { ...p }
      for (let transform of transforms) {
        point = transform?.(point) ?? point
      }
      return point
    })
  }

  public set dots(dots: Point[]) {
    this.source = dots
  }

  constructor(width: number, height: number, dots: Point[]) {
    this.width = width
    this.height = height
    this.source = dots

    this.applyTransforms()
  }

  private applyTransforms() {
    // Transforms need to be applied in order
    // const transforms = [
    //   this.transforms.get("color"),
    //   this.transforms.get("filter"),
    // ]
    // this.dots = this.source.map((p) => {
    //   let point = { ...p }
    //   for (let transform of transforms) {
    //     point = transform?.(point) ?? point
    //   }
    //   return point
    // })
  }

  private pointOverlapsShape(point: Point): boolean {
    if (!this.imageData) {
      return false
    }

    for (let i = 0; i <= point.r; i++) {
      for (let r = 0; r <= point.r; r++) {
        const x = point.x + Math.cos(i * Math.PI * 2) * r
        const y = point.y + Math.sin(i * Math.PI * 2) * r

        const index = (Math.floor(y) * this.imageData.width + Math.floor(x)) * 4

        const red = this.imageData.data[index]
        const green = this.imageData.data[index + 1]
        const blue = this.imageData.data[index + 2]
        const alpha = this.imageData.data[index + 3]

        if ((red + green + blue) * (alpha / 255) < 127) {
          return true
        }
      }
    }

    return false
  }

  public simulateColorBlindness(type: ColorDeficiencyType) {
    this.transforms.set("filter", (point) => {
      const color = new Color(point.color ?? "#000000").to("srgb")
      let transform = brettel.normal

      switch (type) {
        case "protanopia":
        case "protanomaly":
        case "deuteranopia":
        case "deuteranomaly":
        case "tritanopia":
        case "tritanomaly":
          transform = brettel[type]
          break

        case "achromatopsia":
        case "achromatomaly":
          break
      }

      color.coords = transform(color.coords)

      return {
        ...point,
        color: color.toString({ space: "srgb" }),
      }
    })

    this.applyTransforms()
  }

  public setDeficiencyType(type: "deutan" | "tritan" | "protan") {
    const confusionLines = generateConfusionLines(type)
    const i = Math.round(Math.random() * (confusionLines.length - 1))
    const randomConfusionLine = confusionLines[i]

    this.transforms.set("color", (point) => {
      return {
        ...point,
        color: this.pointOverlapsShape(point)
          ? randomConfusionLine(Math.random() * 0.5).toString()
          : randomConfusionLine(0.5 + Math.random() * 0.5).toString(),
      }
    })

    this.applyTransforms()
  }

  // public setColorScheme(scheme: "deutan" | "tritan" | "protan") {
  //   const confusionLines = generateConfusionLines(scheme)
  //   const i = Math.round(Math.random() * (confusionLines.length - 1))
  //   const randomConfusionLine = confusionLines[i]

  //   this.transforms.set("color", (point) => {
  //     return {
  //       ...point,
  //       color: this.pointOverlapsShape(point)
  //         ? randomConfusionLine(Math.random() * 0.3).toString()
  //         : randomConfusionLine(0.7 + Math.random() * 0.3).toString(),
  //     }
  //   })

  //   this.applyTransforms()
  // }

  public addShape(shape: ImageData) {
    const ratio = Math.min(this.width / shape.width, this.height / shape.height)
    const scaledImageWidth = shape.width * ratio
    const scaledImageHeight = shape.height * ratio

    const imageCanvas = new OffscreenCanvas(shape.width, shape.height)
    const plateCanvas = new OffscreenCanvas(this.width, this.height)
    const imageContext = imageCanvas.getContext("2d")!
    const plateContext = plateCanvas.getContext("2d")!

    imageContext.putImageData(shape, 0, 0)

    plateContext.fillStyle = "#ffffff"
    plateContext.fillRect(0, 0, this.width, this.height)
    plateContext.drawImage(
      imageCanvas,
      (this.width - scaledImageWidth) / 2,
      (this.height - scaledImageHeight) / 2,
      scaledImageWidth,
      scaledImageHeight,
    )

    this.imageData = plateContext.getImageData(0, 0, this.width, this.height)

    this.applyTransforms()
  }

  public addImage(image: ImageData) {
    const ratio = Math.min(this.width / image.width, this.height / image.height)
    const scaledImageWidth = image.width * ratio
    const scaledImageHeight = image.height * ratio

    const imageCanvas = new OffscreenCanvas(image.width, image.height)
    const plateCanvas = new OffscreenCanvas(this.width, this.height)
    const imageContext = imageCanvas.getContext("2d")!
    const plateContext = plateCanvas.getContext("2d")!

    imageContext.putImageData(image, 0, 0)

    plateContext.fillStyle = "#ffffff"
    plateContext.fillRect(0, 0, this.width, this.height)
    plateContext.drawImage(
      imageCanvas,
      (this.width - scaledImageWidth) / 2,
      (this.height - scaledImageHeight) / 2,
      scaledImageWidth,
      scaledImageHeight,
    )

    this.imageData = plateContext.getImageData(0, 0, this.width, this.height)

    this.applyTransforms()
  }
}
