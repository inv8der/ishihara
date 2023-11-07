import math from '../../math'
import Vector from '../utils/vector'

export default class Point {
  static origin() {
    /** Returns the Point (0 | 0 | 0) */
    return new Point(0, 0, 0)
  }

  x: number
  y: number
  z: number

  /**
   * - Point(a, b, c)
   * - Point([a, b, c]):
   * The point with coordinates (a | b | c)
   *
   * - Point(Vector):
   * The point that you get when you move the origin by the given
   * vector. If the vector has coordinates (a | b | c), the point
   * will have the coordinates (a | b | c) (as easy as pi).
   */
  constructor(x: number, y: number, z: number)
  constructor(coords: [number, number, number])
  constructor(vector: Vector)
  constructor(
    ...args: [number, number, number] | [[number, number, number]] | [Vector]
  ) {
    let coords
    if (args.length == 1) {
      // Initialisation by Vector is also handled by this
      coords = args[0]
    } else if (args.length == 3) {
      coords = args
    } else {
      throw new Error('Point() takes one or three arguments')
    }

    ;[this.x, this.y, this.z] = coords
  }

  equals(other: Point): boolean {
    /** Checks if two Points are equal. Always use == and not 'is'! */
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

  pv(): Vector {
    /** Return the position vector of the point. */
    return new Vector(this.x, this.y, this.z)
  }

  distance(point: Point): number {
    /** Return the distance between self and other */
    return Math.sqrt(
      (this.x - point.x) ** 2 +
        (this.y - point.y) ** 2 +
        (this.z - point.z) ** 2
    )
  }
}
