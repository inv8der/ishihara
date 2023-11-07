import math from '../../math'
import Vector, { dot, cross, subtract } from '../utils/vector'
import Point from './point'
import Line from './line'
import Polygon from './polygon'
import Segment from './segment'

export default class Plane {
  static xyPlane() {
    /** return xy plane which is a Plane */
    return new Plane(Point.origin(), Vector.zUnitVector())
  }

  static yzPlane() {
    /** return yz plane which is a Plane */
    return new Plane(Point.origin(), Vector.xUnitVector())
  }

  static xzPlane() {
    /** return xz plane which is a Plane */
    return new Plane(Point.origin(), Vector.yUnitVector())
  }

  position: Point
  normal: Vector

  /**
   * - Plane(Point, Point, Point):
   * Initialise a plane going through the three given points.
   *
   * - Plane(Point, Vector, Vector):
   * Initialise a plane given by a point and two vectors lying on
   * the plane.
   *
   * - Plane(Point, Vector):
   * Initialise a plane given by a point and a normal vector (point
   * normal form)
   *
   * - Plane(a, b, c, d):
   * Initialise a plane given by the equation
   * ax1 + bx2 + cx3 = d (general form).
   */
  constructor(p1: Point, p2: Point, p3: Point)
  constructor(p: Point, v1: Vector, v2: Vector)
  constructor(p: Point, normal: Vector)
  constructor(
    ...args: [Point, Point, Point] | [Point, Vector, Vector] | [Point, Vector]
  ) {
    if (args.length == 3) {
      /** Initialise a plane given in the point normal form. */
      const [a, b, c] = args

      // For three points we just calculate the vectors AB
      // and AC and continue like we were given two vectors
      // instead
      const vab =
        b instanceof Point && c instanceof Point
          ? subtract(b.pv(), a.pv())
          : (b as Vector)
      const vac =
        b instanceof Point && c instanceof Point
          ? subtract(c.pv(), a.pv())
          : (c as Vector)

      // We need a vector orthogonal to the two given ones so we
      // (the length doesn't matter) so we just use the cross
      // product
      const normal = cross(vab, vac)
      this.position = a.clone()
      this.normal = normal.normalized()
    } else {
      /** Initialise a plane given in the point normal form. */
      this.position = args[0].clone()
      this.normal = args[1].clone()
    }
  }

  equals(other: Plane): boolean {
    /**
     * Checks if two planes are equal. Two planes can be equal even
     * if the representation is different!
     */
    return other.contains(this.position) && this.normal.parallel(other.normal)
  }

  getHashCode(): string {
    return btoa(
      [
        'Plane',
        math.round(this.normal[0], 6),
        math.round(this.normal[1], 6),
        math.round(this.normal[2], 6),
        math.round(dot(this.normal, this.position.pv()), 6),
      ].join()
    )
  }

  clone(): Plane {
    return new Plane(this.position, this.normal)
  }

  contains(other: Point | Segment | Line | Polygon): boolean {
    if (other instanceof Point) {
      return math.equal(
        dot(other.pv(), this.normal) - dot(this.position.pv(), this.normal),
        0
      ) as boolean
    } else if (other instanceof Segment) {
      return this.contains(other.start) && this.contains(other.end)
    } else if (other instanceof Line) {
      return this.contains(new Point(other.position)) && this.parallel(other)
    } else if (other instanceof Polygon) {
      return this.equals(other.plane)
    }

    return false
  }

  translate(offset: Vector): Plane {
    this.position.translate(offset)
    return this
  }

  negate(): Plane {
    this.normal.negate()
    return this
  }

  parallel(other: Line | Plane): boolean {
    if (other instanceof Line) {
      return other.direction.orthogonal(this.normal)
    } else if (other instanceof Plane) {
      return other.normal.parallel(this.normal)
    }

    return false
  }
}
