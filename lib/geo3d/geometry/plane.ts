import math from '../../math'
import { Vector, dot, cross, subtract } from '../utils/vector'
import { Point } from './point'
import { Line } from './line'
import { Polygon } from './polygon'
import { Segment } from './segment'

export class Plane {
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

  constructor(p1: Point, p2: Point, p3: Point)
  constructor(point: Point, normal: Vector)
  constructor(...args: [Point, Point, Point] | [Point, Vector]) {
    if (args.length == 3) {
      const [a, b, c] = args

      // For three points we first calculate the vectors AB and AC...
      const vab = subtract(b.toVector(), a.toVector())
      const vac = subtract(c.toVector(), a.toVector())

      // Then we compute the vector orthogonal to those two. This will be our normal
      this.normal = cross(vab, vac).normalize()
      this.position = a.clone()
    } else {
      this.position = args[0].clone()
      this.normal = args[1].clone().normalize()
    }
  }

  equals(other: Plane): boolean {
    return other.contains(this.position) && this.normal.parallel(other.normal)
  }

  getHashCode(): string {
    return btoa(
      [
        'Plane',
        math.round(this.normal[0], 6),
        math.round(this.normal[1], 6),
        math.round(this.normal[2], 6),
        math.round(dot(this.normal, this.position.toVector()), 6),
      ].join()
    )
  }

  clone(): Plane {
    return new Plane(this.position, this.normal)
  }

  contains(other: Point | Segment | Line | Polygon): boolean {
    if (other instanceof Point) {
      return math.equal(
        dot(other.toVector(), this.normal) -
          dot(this.position.toVector(), this.normal),
        0
      ) as boolean
    } else if (other instanceof Segment) {
      return this.contains(other.start) && this.contains(other.end)
    } else if (other instanceof Line) {
      return this.contains(other.position) && this.parallel(other)
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
