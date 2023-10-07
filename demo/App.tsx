import { useRef, useLayoutEffect, useEffect, useState } from 'react'
import { IshiharaPlate, DotGenerator, createShape } from '../lib'
import './App.css'

const width = 700
const height = 700
const minRadius = 3.5 // (width + height) / 600
const maxRadius = 15 // (width + height) / 150
const maxIterations = 10000

type Shapes = Record<'circle' | 'triangle' | 'square', ImageData>

export default function App() {
  const plateRef = useRef<IshiharaPlate>()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [shapes, setShapes] = useState<Shapes>()

  useEffect(() => {
    Promise.all([
      createShape('circle'),
      createShape('triangle'),
      createShape('square'),
    ]).then((shapes) => {
      setShapes({
        circle: shapes[0],
        triangle: shapes[1],
        square: shapes[2],
      })
    })
  }, [])

  useLayoutEffect(() => {
    if (shapes) {
      const plate = new IshiharaPlate(width, height)
      plateRef.current = plate

      plate.addShape(shapes.circle)
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
    }
  }, [shapes])

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
