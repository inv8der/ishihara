import math from '../../math'
import Point from '../geometry/point'

export function dot(a: Vector, b: Vector): number {
  return math.dot(a.toArray(), b.toArray())
}

/**
 * Calculates the cross product of two vectors, defined as
 * _   _   / x2y3 - x3y2 \
 * x × y = | x3y1 - x1y3 |
 *         \ x1y2 - x2y1 /
 *
 * The cross product is orthogonal to both vectors and its length
 * is the area of the parallelogram given by x and y.
 */
export function cross(a: Vector, b: Vector): Vector {
  const result = math.cross(a.toArray(), b.toArray()) as [
    number,
    number,
    number,
  ]
  return new Vector(result)
}

export function multiply(a: number, b: Vector): Vector
export function multiply(a: Vector, b: number): Vector
export function multiply(a: number | Vector, b: Vector | number): Vector {
  const scalar = typeof a === 'number' ? a : (b as number)
  const vector = a instanceof Vector ? a : (b as Vector)
  const result = math.multiply(scalar, vector.toArray()) as [
    number,
    number,
    number,
  ]
  return new Vector(result)
}

export function add(a: Vector, b: Vector): Vector {
  return new Vector(math.add(a.toArray(), b.toArray()))
}

export function subtract(a: Vector, b: Vector): Vector {
  return new Vector(math.subtract(a.toArray(), b.toArray()))
}

export default class Vector {
  static zero() {
    /** Returns the zero vector (0 | 0 | 0) */
    return new Vector(0, 0, 0)
  }

  static xUnitVector() {
    /** Returns the unit vector (1 | 0 | 0) */
    return new Vector(1, 0, 0)
  }

  static yUnitVector() {
    /** Returns the unit vector (0 | 1 | 0) */
    return new Vector(0, 1, 0)
  }

  static zUnitVector() {
    /** Returns the unit vector (0 | 0 | 1) */
    return new Vector(0, 0, 1)
  }

  public v: [number, number, number]
  public 0: number
  public 1: number
  public 2: number

  constructor(x: number, y: number, z: number)
  constructor(vector: [number, number, number])
  constructor(a: Point, b: Point)
  constructor(
    ...args:
      | [number, number, number]
      | [[number, number, number]]
      | [Point, Point]
  ) {
    /**
     * Vector(x, y, z)
     * Vector([x, y, z]):
     * A vector with coordinates (x | y | z)
     *
     * Vector(P1, P2):
     * A vector going from point P1 to P2.
     */
    if (args.length == 3) {
      // Initialising with 3 coordinates
      this.v = args
      this[0] = this.v[0]
      this[1] = this.v[1]
      this[2] = this.v[2]
    } else if (args.length == 2) {
      // Initialising from point A to point B
      const [a, b] = args
      this.v = [b.x - a.x, b.y - a.y, b.z - a.z]
      this[0] = this.v[0]
      this[1] = this.v[1]
      this[2] = this.v[2]
    } else if (args.length == 1) {
      // Initialising with an array of coordinates
      this.v = args[0]
      this[0] = this.v[0]
      this[1] = this.v[1]
      this[2] = this.v[2]
    } else {
      throw new Error('Vector() takes one, two or three parameters')
    }
  }

  equals(vector: Vector): boolean {
    const result = math.equal(this.v, vector.v) as unknown as [
      boolean,
      boolean,
      boolean,
    ]
    return result.every((bool) => bool)
  }

  getHashCode() {
    return btoa(
      [
        'Vector',
        math.round(this[0], 6),
        math.round(this[1], 6),
        math.round(this[2], 6),
        math.round(this[0], 6) * math.round(this[1], 6),
        math.round(this[1], 6) * math.round(this[2], 6),
        math.round(this[2], 6) * math.round(this[0], 6),
      ].join()
    )
  }

  *[Symbol.iterator]() {
    yield this.v[0]
    yield this.v[1]
    yield this.v[2]
  }

  length(): number {
    /** Returns |v|, the length of the vector. */
    const product = dot(this, this)
    return product ** 0.5
  }

  parallel(vector: Vector): boolean {
    /** Returns true if both vectors are parallel. */
    if (this.equals(Vector.zero()) || vector.equals(Vector.zero())) {
      return true
    }
    if (this.equals(vector)) {
      return true
    }
    return math.equal(
      (Math.abs(dot(this, vector)) - this.length() * vector.length()) /
        this.length(),
      0
    ) as boolean
  }

  orthogonal(vector: Vector): boolean {
    /** Returns true if the two vectors are orthogonal */
    return math.equal(dot(this, vector), 0) as boolean
    // return Math.abs(this.multiply(vector)) < get_eps()
  }

  angle(vector: Vector): number {
    /** Returns the angle (in radians) enclosed by both vectors. */
    return Math.acos(dot(this, vector) / (this.length() * vector.length()))
  }

  normalized() {
    /**
     * Return the normalized version of the vector, that is a vector
     * pointing in the same direction but with length 1.
     */
    // Division is not defined, so we have to multiply by 1/|v|
    return multiply(this, 1 / this.length())
  }

  clone(): Vector {
    return new Vector(this[0], this[1], this[2])
  }

  negate(): Vector {
    this.v = math.multiply(this.v, -1) as [number, number, number]
    this[0] = this.v[0]
    this[1] = this.v[1]
    this[2] = this.v[2]

    return this
  }

  toArray(): [number, number, number] {
    return [...this.v]
  }
}
