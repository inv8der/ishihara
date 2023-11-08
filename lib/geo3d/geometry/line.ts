import math from '../../math'
import { Vector, subtract } from '../utils/vector'
import { Point } from './point'
import { Segment } from './segment'

export class Line {
  static xAxis() {
    /** return x axis which is a Line */
    return new Line(Point.origin(), new Point(1, 0, 0))
  }

  static yAxis() {
    /** return y axis which is a Line */
    return new Line(Point.origin(), new Point(0, 1, 0))
  }

  static zAxis() {
    /** return z axis which is a Line */
    return new Line(Point.origin(), new Point(0, 0, 1))
  }

  position: Point
  direction: Vector

  constructor(p1: Point, p2: Point)
  constructor(point: Point, direction: Vector)
  constructor(a: Point, b: Point | Vector) {
    this.position = a.clone()
    this.direction =
      b instanceof Point
        ? subtract(b.toVector(), a.toVector()).normalize()
        : b.clone().normalize()

    if (this.direction.equals(Vector.zero())) {
      throw new Error(
        'Line cannot be initialized with a direction vector of (0, 0, 0)'
      )
    }
  }

  equals(other: Line): boolean {
    return (
      this.contains(other.position) && other.direction.parallel(this.direction)
    )
  }

  getHashCode() {
    return btoa(
      [
        'Line',
        math.round(this.direction[0], 6),
        math.round(this.direction[1], 6),
        math.round(
          this.direction[0] * this.position.y -
            this.direction[1] * this.position.x,
          6
        ),
      ].join()
    )
  }

  contains(other: Point | Segment): boolean {
    /** Checks if a object lies on a line */
    if (other instanceof Point) {
      const v = subtract(other.toVector(), this.position.toVector())
      return v.parallel(this.direction)
    } else if (other instanceof Segment) {
      return this.contains(other.start) && this.contains(other.end)
    }
    return false
  }

  translate(offset: Vector): Line {
    this.position.translate(offset)
    return this
  }
}
