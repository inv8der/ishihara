import { useRef, useLayoutEffect } from 'react'
import * as ishihara from '../lib'
import './App.css'

export default function App() {
  const plateRef = useRef<ishihara.IshiharaPlate>()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const width = 700
  const height = 700
  const minRadius = 3.5 // (width + height) / 600
  const maxRadius = 15 // (width + height) / 150
  const maxIterations = 10000

  useLayoutEffect(() => {
    let mounted = true

    const options = {
      height,
      width,
      minRadius,
      maxRadius,
      maxIterations,
    }

    async function createIshiharaPlate() {
      const shape = await ishihara.createShape('circle')

      if (mounted) {
        const plate = new ishihara.IshiharaPlate(width, height)
        plate.addShape(shape)
        plate.setColors('tritan')

        const generator = new ishihara.DotGenerator(options)
        generator.addEventListener('update', () => {
          plate.dots = generator.data

          const ctx = canvasRef.current?.getContext('2d')
          if (ctx) {
            plate.draw(ctx)
          }
        })
        generator.start()

        plateRef.current = plate
      }
    }

    createIshiharaPlate()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div>
      <canvas width={width} height={height} ref={canvasRef} />
      <button
        onClick={() => {
          const plate = plateRef.current
          const ctx = canvasRef.current?.getContext('2d')

          if (plate && ctx) {
            plate.simulateColorBlindness('protanopia')
            plate.draw(ctx)
          }
        }}
      >
        Simulate Color Blindness
      </button>
    </div>
  )
}
