import math from '../../math'
import Point from '../geometry/point'

export function dot(a: Vector, b: Vector): number {
  return math.dot(a.toArray(), b.toArray())
}

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

  static x_unit_vector() {
    /** Returns the unit vector (1 | 0 | 0) */
    return new Vector(1, 0, 0)
  }

  static y_unit_vector() {
    /** Returns the unit vector (0 | 1 | 0) */
    return new Vector(0, 1, 0)
  }

  static z_unit_vector() {
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

  // __hash__(self) {
  //     /** return the hash of a vector */
  //     return hash(("Vector",
  //     round(self._v[0],get_sig_figures()),
  //     round(self._v[1],get_sig_figures()),
  //     round(self._v[2],get_sig_figures()),
  //     round(self._v[0],get_sig_figures()) * round(self._v[1],get_sig_figures()),
  //     round(self._v[1],get_sig_figures()) * round(self._v[2],get_sig_figures()),
  //     round(self._v[2],get_sig_figures()) * round(self._v[0],get_sig_figures()),
  //     ))
  // }

  equals(vector: Vector): boolean {
    // @todo configure epsilon
    const result = math.equal(this.v, vector.v) as unknown as [
      boolean,
      boolean,
      boolean,
    ]
    return result.every((bool) => bool)

    // return (
    //   Math.abs(this._v[0] - other._v[0]) < get_eps() &&
    //   Math.abs(this._v[1] - other._v[1]) < get_eps() &&
    //   Math.abs(this._v[2] - other._v[2]) < get_eps()
    // )
  }

  add(vector: Vector): Vector {
    return new Vector(math.add(this.v, vector.v))
  }

  subtract(vector: Vector): Vector {
    return new Vector(math.subtract(this.v, vector.v))
  }

  multiply(scalar: number): Vector
  multiply(vector: Vector): number
  multiply(scalarOrVector: number | Vector): Vector | number {
    if (scalarOrVector instanceof Vector) {
      return math.dot(this.v, scalarOrVector.v)
    }
    const result = math.multiply(this.v, scalarOrVector) as [
      number,
      number,
      number,
    ]
    return new Vector(result)
  }

  //   __getitem__(item) {
  //     return this._v[item]
  //   }

  //   __setitem__(item, value) {
  //     this._v[item] = value
  //   }

  *[Symbol.iterator]() {
    yield this.v[0]
    yield this.v[1]
    yield this.v[2]
  }

  cross(vector: Vector): Vector {
    /**
     * Calculates the cross product of two vectors, defined as
     * _   _   / x2y3 - x3y2 \
     * x × y = | x3y1 - x1y3 |
     *         \ x1y2 - x2y1 /
     *
     * The cross product is orthogonal to both vectors and its length
     * is the area of the parallelogram given by x and y.
     */

    const result = math.cross(this.v, vector.v) as [number, number, number]
    return new Vector(result)

    // return new Vector(
    //   a[1] * b[2] - a[2] * b[1],
    //   a[2] * b[0] - a[0] * b[2],
    //   a[0] * b[1] - a[1] * b[0]
    // )
  }

  length(): number {
    /** Returns |v|, the length of the vector. */
    const product = this.multiply(this)
    return product ** 0.5
  }

  //   __abs__ = length

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

    // return (
    //   Math.abs(Math.abs(dot(this, vector)) - this.length() * vector.length()) <
    //   get_eps() * this.length()
    // )
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
    return this.multiply(1 / this.length())
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
