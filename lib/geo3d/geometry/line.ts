import GeoBody from './body'
import Point from './point'
import Segment from './segment'
import Vector, { subtract } from '../utils/vector'

export default class Line implements GeoBody {
  /**
   * - Line(Point, Point):
   * A Line going through both given points.
   *
   * - Line(Point, Vector):
   * A Line going through the given point, in the direction pointed
   * by the given Vector.
   *
   * - Line(Vector, Vector):
   * The same as Line(Point, Vector), but with instead of the point
   * only the position vector of the point is given.
   */
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

  position: Vector
  direction: Vector

  constructor(p1: Point, p2: Point)
  constructor(point: Point, vector: Vector)
  constructor(v1: Vector, v2: Vector)
  constructor(a: Point | Vector, b: Point | Vector) {
    // We're storing the position vector, so if a point is given we need to convert it first
    this.position = a instanceof Point ? a.pv().clone() : a.clone()
    // We just take the vector AB as the direction vector
    this.direction =
      b instanceof Point ? subtract(b.pv(), this.position) : b.clone()

    if (this.direction.equals(Vector.zero())) {
      throw new Error(
        'Line cannot be initialized with a direction vector of (0, 0, 0)'
      )
    }
  }

  contains(other: Point | Segment): boolean {
    /** Checks if a object lies on a line */
    if (other instanceof Point) {
      const v = subtract(other.pv(), this.position)
      return v.parallel(this.direction)
    } else if (other instanceof Segment) {
      return this.contains(other.start) && this.contains(other.end)
    }
    return false
  }

  equals(other: Line): boolean {
    /** Checks if two lines are equal */
    return (
      this.contains(new Point(other.position)) &&
      other.direction.parallel(this.direction)
    )
  }

  // def __hash__(self):
  //     """Return hash of a Line"""
  //     return hash(("Line",
  //     round(self.dv[0],SIG_FIGURES),
  //     round(self.dv[1],SIG_FIGURES),
  //     round(self.dv[0] * self.sv[1] - self.dv[1] * self.sv[0],SIG_FIGURES)
  //     ))

  translate(offset: Vector): Line {
    this.position[0] += offset[0]
    this.position[1] += offset[1]
    this.position[2] += offset[2]
    return this
  }
}
