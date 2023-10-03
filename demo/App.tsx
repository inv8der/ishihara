import { useRef, useState, useLayoutEffect } from 'react'
import * as ishihara from '../lib'
import { IshiharaFactory } from '../lib/factory'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
import './App.css'

type Point = {
  x: number
  y: number
  r: number
  color?: string
}

export default function App() {
  const plateRef = useRef<ishihara.IshiharaPlate>()

  const [dots, setDots] = useState<Point[]>([])

  const width = 700
  const height = 700
  const minRadius = 3.5 // (width + height) / 600
  const maxRadius = 15 // (width + height) / 150
  const maxIterations = 10000

  useLayoutEffect(() => {
    const options = {
      height,
      width,
      minRadius,
      maxRadius,
      maxIterations,
    }

    // const generator = ishihara
    //   .generator(options)
    //   .on("update", () => {
    //     setDots(generator.data)
    //   })
    //   .on("finish", async () => {
    //     const shape = await ishihara.ShapeFactory.create("circle")
    //     const plate = new ishihara.IshiharaPlate(width, height, generator.data)
    //     plate.addShape(shape)
    //     plate.setDeficiencyType("protan")

    //     setDots(plate.dots)
    //     plateRef.current = plate
    //   })
    //   .start()

    async function createIshiharaPlate() {
      const plate = await IshiharaFactory.create(options)
      const shape = await ishihara.ShapeFactory.create('circle')

      plate.addShape(shape)
      plate.setDeficiencyType('protan')
      plateRef.current = plate

      setDots(plate.dots)
    }

    createIshiharaPlate()

    // return () => {
    //   generator.stop()
    // }
  }, [])

  // return (
  //   <>
  //     <div>
  //       <a href="https://vitejs.dev" target="_blank">
  //         <img src={viteLogo} className="logo" alt="Vite logo" />
  //       </a>
  //       <a href="https://react.dev" target="_blank">
  //         <img src={reactLogo} className="logo react" alt="React logo" />
  //       </a>
  //     </div>
  //     <h1>Vite + React</h1>
  //     <div className="card">
  //       <button onClick={() => setCount((count) => count + 1)}>
  //         count is {count}
  //       </button>
  //       <p>
  //         Edit <code>src/App.tsx</code> and save to test HMR
  //       </p>
  //     </div>
  //     <p className="read-the-docs">
  //       Click on the Vite and React logos to learn more
  //     </p>
  //   </>
  // )

  return (
    <div>
      <svg width={width} height={height}>
        {dots.map(({ x, y, r, color }, index) => (
          <circle key={index} cx={x} cy={y} r={r} fill={color} />
        ))}
      </svg>
      <button
        onClick={() => {
          if (plateRef.current) {
            plateRef.current.simulateColorBlindness('protanopia')
            setDots(plateRef.current.dots)
          }
        }}
      >
        Simulate Color Blindness
      </button>
    </div>
  )
}
