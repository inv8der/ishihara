import math from '../../math'
import Vector, { dot, cross, subtract } from '../utils/vector'
import {
  intersectPlaneSegment,
  intersectPlanePlane,
  intersectPlanePolygon,
  intersectPlanePolyhedron,
  intersectLinePlane,
  intersectPointPlane,
} from '../utils/intersection'
import Point from './point'
import GeoBody from './body'
import Line from './line'
import Polygon from './polygon'
import Polyhedron from './polyhedron'
import Segment from './segment'

export default class Plane implements GeoBody {
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

  public position: Point
  public normal: Vector

  static xy_plane() {
    /** return xy plane which is a Plane */
    return new Plane(Point.origin(), Vector.z_unit_vector())
  }

  static yz_plane() {
    /** return yz plane which is a Plane */
    return new Plane(Point.origin(), Vector.x_unit_vector())
  }

  static xz_plane() {
    /** return xz plane which is a Plane */
    return new Plane(Point.origin(), Vector.y_unit_vector())
  }

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

  contains(other: Point | Segment | Line | Polygon): boolean {
    /**
     * Checks if a Point lies on the Plane or a Line is a subset of
     * the plane.
     */
    if (other instanceof Point) {
      // return math.equal(other.pv() * this.n - this.p.pv() * this.n, 0)
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
    } else {
      throw new Error('Not implemented')
    }
  }

  translate(offset: Vector) {
    this.position.translate(offset)
    return this
  }

  negate() {
    this.normal.negate()
    return this
  }

  parallel(other: Line | Plane): boolean {
    /**
     * **Input:**
     * - a:Line/Plane/Plane/Vector
     * - b:Line/Line/Plane/Vector
     *
     * **Output:*
     * A boolean of whether the two objects are parallel. This can check
     * - Line/Line
     * - Plane/Line
     * - Plane/Plane
     * - Vector/Vector
     */

    if (other instanceof Line) {
      return other.direction.orthogonal(this.normal)
    } else {
      return other.normal.parallel(this.normal)
    }
  }

  intersection(other: unknown): unknown {
    if (other instanceof Point) {
      return intersectPointPlane(other, this)
    } else if (other instanceof Segment) {
      return intersectPlaneSegment(this, other)
    } else if (other instanceof Line) {
      return intersectLinePlane(other, this)
    } else if (other instanceof Plane) {
      return intersectPlanePlane(this, other)
    } else if (other instanceof Polygon) {
      return intersectPlanePolygon(this, other)
    } else if (other instanceof Polyhedron) {
      return intersectPlanePolyhedron(this, other)
    }
  }
}
