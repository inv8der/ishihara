import math from '../../math'
import { Vector } from '../utils/vector'

export class Point {
  static origin() {
    /** Returns the Point (0 | 0 | 0) */
    return new Point(0, 0, 0)
  }

  x: number
  y: number
  z: number

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

  clone(): Point {
    return new Point(this.x, this.y, this.z)
  }

  translate(offset: Vector) {
    this.x += offset[0]
    this.y += offset[1]
    this.z += offset[2]

    return this
  }

  toVector(): Vector {
    return new Vector(this.x, this.y, this.z)
  }
}
