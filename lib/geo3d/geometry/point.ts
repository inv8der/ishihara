import math from '../../math'
import { Vector } from '../utils/vector'
import type { Geometry } from './geometry'

export class Point implements Geometry<Point> {
  static origin() {
    return new Point(0, 0, 0)
  }

  x: number
  y: number
  z: number

  get vector(): Vector {
    return new Vector(this.x, this.y, this.z)
  }

  constructor(x: number, y: number, z: number)
  constructor(coords: [number, number, number])
  constructor(vector: Vector)
  constructor(
    ...args: [number, number, number] | [[number, number, number]] | [Vector]
  ) {
    let coords
    if (args.length == 1) {
      // Initialisation by vector is also handled by this
      coords = args[0]
    } else if (args.length == 3) {
      coords = args
    } else {
      throw new Error('Point() takes one or three arguments')
    }

    ;[this.x, this.y, this.z] = coords
  }

  equals(other: Point): boolean {
    const result = math.equal(
      [this.x, this.y, this.z],
      [other.x, other.y, other.z]
    ) as unknown as [number, number, number]

    return result.every((bool) => bool)
  }

  getHashCode() {
    return btoa(
      [
        'Point',
        math.round(this.x, 6),
        math.round(this.y, 6),
        math.round(this.z, 6),
        math.round(this.x, 6) * math.round(this.y, 6),
        math.round(this.x, 6) * math.round(this.z, 6),
        math.round(this.y, 6) * math.round(this.z, 6),
      ].join()
    )
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  contains<T extends Geometry<T>>(other: T): boolean {
    // A point is the lowest dimensional object so it cannot contain any other geometry
    return false
  }

  translate(offset: Vector): Point {
    this.x += offset[0]
    this.y += offset[1]
    this.z += offset[2]

    return this
  }

  clone(): Point {
    return new Point(this.x, this.y, this.z)
  }
}
