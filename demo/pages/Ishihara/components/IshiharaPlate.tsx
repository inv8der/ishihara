import { useRef, useEffect, useLayoutEffect, useState } from 'react'
import { Box } from '@chakra-ui/react'
// import * as ishihara from '../../../../dist/ishihara'
import * as ishihara from '../../../../lib'
import { useIshiharaStore } from '../store'

const width = 700
const height = 700
const minRadius = 3.5 // (width + height) / 600
const maxRadius = 15 // (width + height) / 150
const maxIterations = 10000

export default function IshiharaPlate() {
  const store = useIshiharaStore()

  const svgRef = useRef<SVGSVGElement>(null)
  const [generating, setGenerating] = useState(true)
  const [dots, setDots] = useState<ishihara.Point[]>([])
  const [plate] = useState(new ishihara.IshiharaPlate(width, height))

  useEffect(() => {
    plate.addShape(store.shape)
    setDots(plate.paintDots())
  }, [plate, store.shape])

  useEffect(() => {
    plate.setColors(store.colorScheme)
    setDots(plate.paintDots())
  }, [plate, store.colorScheme])

  useEffect(() => {
    if (store.colorBlindMode) {
      plate.simulateColorBlindness(store.colorBlindMode, store.severity)
    } else {
      plate.simulateColorBlindness(false)
    }
    setDots(plate.paintDots())
  }, [plate, store.colorBlindMode, store.severity])

  useLayoutEffect(() => {
    const generator = new ishihara.DotGenerator({
      height,
      width,
      minRadius,
      maxRadius,
      maxIterations,
    })
    generator.addEventListener('update', () => {
      plate.dots = generator.data

      const svg = svgRef.current
      const dot = plate.paintDots().at(-1)

      if (svg && dot) {
        const circle = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'circle'
        )
        circle.setAttribute('r', `${dot.radius}`)
        circle.setAttribute('cx', `${dot.x}`)
        circle.setAttribute('cy', `${dot.y}`)
        circle.setAttribute('fill', dot.color || '#000000')
        svg.appendChild(circle)
      }
    })
    generator.addEventListener('finish', () => {
      setDots(plate.paintDots())
      setGenerating(false)
    })

    generator.start()
    setGenerating(true)

    return () => {
      generator.stop()
    }
  }, [plate])

  const viewBox = `0 0 ${width} ${height}`

  return (
    <Box width="100%" height="100%" display="flex" justifyContent="center">
      {generating ? (
        <svg
          key="generating"
          ref={svgRef}
          viewBox={viewBox}
          style={{ maxWidth: '700px' }}
        />
      ) : (
        <svg key="complete" viewBox={viewBox} style={{ maxWidth: '700px' }}>
          {dots.map(({ id, x, y, radius, color }) => (
            <circle key={id} cx={x} cy={y} r={radius} fill={color} />
          ))}
        </svg>
      )}
    </Box>
  )
}
