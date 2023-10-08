import { useRef, useLayoutEffect, useState } from 'react'
import { IshiharaPlate, DotGenerator } from '../lib'
import type { Point } from '../lib/types'
import './App.css'

const width = 700
const height = 700
const minRadius = 3.5 // (width + height) / 600
const maxRadius = 15 // (width + height) / 150
const maxIterations = 10000

export default function App() {
  // const canvasRef = useRef<HTMLCanvasElement>(null)
  const plateRef = useRef<IshiharaPlate>()
  const [dots, setDots] = useState<Point[]>([])

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
      setDots(plate.paintDots())

      // const ctx = canvasRef.current?.getContext('2d')
      // if (ctx) {
      //   plate.draw(ctx)
      // }
    })
    generator.start()

    // const controller = new AbortController()
    // const params = {
    //   height,
    //   width,
    //   minRadius,
    //   maxRadius,
    //   maxIterations,
    //   signal: controller.signal,
    // }

    // generatePlate(params)
    //   .then((plate) => {
    //     plateRef.current = plate
    //     plate.addShape('triangle')
    //     plate.setColors('tritan')
    //     setDots(plate.paintDots())
    //   })
    //   .catch((e) => {
    //     console.error(e)
    //   })

    return () => {
      generator.stop()
      // controller.abort()
    }
  }, [])

  return (
    <div>
      {/* <canvas width={width} height={height} ref={canvasRef} /> */}
      <svg width={width} height={height}>
        {dots.map(({ id, x, y, radius, color }) => (
          <circle key={id} cx={x} cy={y} r={radius} fill={color} />
        ))}
      </svg>
      {/* <button
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
      </button> */}
    </div>
  )
}
