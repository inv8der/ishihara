import IshiharaPlate from "./IshiharaPlate"
import generator from "./generator"
import type { Point } from "./types"

type Options = Parameters<typeof generator>[0]

export class IshiharaFactory {
  public static async create(options: Options): Promise<IshiharaPlate> {
    return new Promise((resolve) => {
      generator(options)
        .on("finish", (data: Point[]) => {
          const plate = new IshiharaPlate(options.width, options.height, data)
          resolve(plate)
        })
        .start()
    })
  }
}
