import { IshiharaPlate } from './ishihara-plate'
import { DotGenerator } from './dot-generator'

type GenerateParams = ConstructorParameters<typeof DotGenerator>[0] & {
  signal?: AbortSignal
}

export async function generatePlate(
  params: GenerateParams
): Promise<IshiharaPlate> {
  return new Promise((resolve, reject) => {
    const { signal, ...options } = params
    const plate = new IshiharaPlate(options.width, options.height)
    const generator = new DotGenerator(options)

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          generator.stop()
          reject(signal.reason)
        },
        { once: true }
      )
    }

    generator.addEventListener('finish', () => {
      plate.dots = generator.data
      resolve(plate)
    })
    generator.start()
  })
}
