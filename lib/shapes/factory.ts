import { loadImageData } from '../utils'
import * as shapes from './shapes'

export default async function createShape(
  shape: 'circle' | 'triangle' | 'square'
): Promise<ImageData> {
  const svg = shapes[shape]
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })

  const url = URL.createObjectURL(blob)
  const imageData = await loadImageData(url)
  URL.revokeObjectURL(url)

  return imageData
}
