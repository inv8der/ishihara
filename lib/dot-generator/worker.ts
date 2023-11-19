import { kdTree } from 'kd-tree-javascript'
import { v4 as uuidv4 } from 'uuid'
import type { Point } from '../types'

interface StartCommand {
  command: 'start'
  args: Parameters<typeof generatePlate>
}

export type WorkerCommand = StartCommand

interface FinishEvent {
  type: 'finish'
  data: Point[]
}

interface UpdateEvent {
  type: 'update'
  data: Point[]
}

export type WorkerEvent = UpdateEvent | FinishEvent

function generateRandomPoint(options: {
  minRadius: number
  maxRadius: number
  bounds: {
    cx: number
    cy: number
    radius: number
  }
}): Omit<Point, 'id'> {
  const { minRadius, maxRadius, bounds } = options

  const radius = minRadius + Math.random() * (maxRadius - minRadius)
  const radians = Math.random() * Math.PI * 2
  const distance = Math.random() * (bounds.radius - radius)
  const x = bounds.cx + Math.cos(radians) * distance
  const y = bounds.cy + Math.sin(radians) * distance

  return { x, y, radius }
}

function* generatePlate(options: {
  width: number
  height: number
  minRadius: number
  maxRadius: number
  maxIterations: number
}): IterableIterator<Point> {
  const { width, height, minRadius, maxRadius, maxIterations } = options
  const nearestCount = Math.ceil((maxRadius / minRadius) * 5)

  const plate = {
    cx: width / 2,
    cy: height / 2,
    radius: width / 2,
  }
  const tree = new kdTree<Point>(
    [],
    (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2,
    ['x', 'y']
  )

  let tries = 0
  while (tries < maxIterations) {
    const p = generateRandomPoint({
      minRadius,
      maxRadius,
      bounds: plate,
    })
    const point: Point = { id: uuidv4(), ...p }
    const nearest = tree.nearest(point, nearestCount)

    const invalidPlacement = nearest.some(([p]) => {
      const a = point.x - p.x
      const b = point.y - p.y
      return a ** 2 + b ** 2 < (point.radius + p.radius) ** 2
    })

    if (invalidPlacement) {
      tries += 1
      continue
    }

    tree.insert(point)
    yield point
    tries = 0
  }
}

self.onmessage = async function (e: MessageEvent) {
  const { command, args } = e.data as WorkerCommand

  switch (command) {
    case 'start': {
      const data = await new Promise<Point[]>((resolve) => {
        const iterator = generatePlate(...args)

        const points: Point[] = []
        for (const value of iterator) {
          points.push(value)
          self.postMessage({ type: 'update', data: points })
        }

        resolve(points)
      })

      self.postMessage({ type: 'finish', data })
      break
    }
  }
}

export {}
