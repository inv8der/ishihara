import { useRef, useLayoutEffect } from 'react'
import { IshiharaPlate, DotGenerator } from '../lib'
import './App.css'

const width = 700
const height = 700
const minRadius = 3.5 // (width + height) / 600
const maxRadius = 15 // (width + height) / 150
const maxIterations = 10000

export default function App() {
  const plateRef = useRef<IshiharaPlate>()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useLayoutEffect(() => {
    const plate = new IshiharaPlate(width, height)
    plateRef.current = plate

    plate.addShape('triangle')
    plate.setColors('tritan')

    const generator = new DotGenerator({
      height,
      width,
      minRadius,
      maxRadius,
      maxIterations,
    })
    generator.addEventListener('update', () => {
      plate.dots = generator.data
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) {
        plate.draw(ctx)
      }
    })
    generator.start()

    return () => {
      generator.stop()
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
