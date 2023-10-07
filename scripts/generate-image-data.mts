#!/usr/bin/env node --loader ts-node/esm

import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createCanvas, loadImage, type ImageData } from 'canvas'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

type TemplateArgs = {
  name: string
  dataArray: Uint8ClampedArray
  width: number
  height: number
}

const generateCode = ({
  name,
  dataArray,
  width,
  height,
}: TemplateArgs): string => {
  const code = `
const pixels = ${JSON.stringify(Array.from(dataArray))}
  
const dataArray = new Uint8ClampedArray(pixels)
const ${name} = new ImageData(dataArray, ${width}, ${height})
export default ${name}
  `

  return code.trim()
}

async function loadImageData(url: string): Promise<ImageData> {
  const image = await loadImage(url)

  const canvas = createCanvas(image.width, image.height)
  const context = canvas.getContext('2d')!
  context.drawImage(image, 0, 0, image.width, image.height)

  return context.getImageData(0, 0, image.width, image.height)
}

async function run() {
  const shapesDir = path.join(__dirname, '../lib/shapes')
  const files = await fs.readdir(path.join(shapesDir, 'svg'), {
    withFileTypes: true,
  })

  await Promise.all(
    files.map(async (fileInfo) => {
      const shapeName = path.parse(fileInfo.name).name
      const imageData = await loadImageData(
        path.join(fileInfo.path, fileInfo.name)
      )

      const code = generateCode({
        name: shapeName,
        dataArray: imageData.data,
        width: imageData.width,
        height: imageData.height,
      })

      const outputFile = path.join(shapesDir, 'generated', `${shapeName}.ts`)
      await fs.writeFile(outputFile, code, 'utf-8')
    })
  )
}

try {
  await run()
} catch (e) {
  process.exitCode = 1
  console.error(e)
} finally {
  process.exit()
}
