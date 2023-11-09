import math from '../../math'
import { Vector, dot, cross, subtract } from '../utils/vector'
import { Point } from './point'
import { Line } from './line'
import { Polygon } from './polygon'
import { Segment } from './segment'
import type { Geometry } from './geometry'

export class Plane implements Geometry<Plane> {
  static xyPlane() {
    return new Plane(Point.origin(), Vector.zUnitVector())
  }

  static yzPlane() {
    return new Plane(Point.origin(), Vector.xUnitVector())
  }

  static xzPlane() {
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
      const vab = subtract(b.vector, a.vector)
      const vac = subtract(c.vector, a.vector)

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
        math.round(dot(this.normal, this.position.vector), 6),
      ].join()
    )
  }

  contains<T extends Geometry<T>>(other: T): boolean {
    if (other instanceof Point) {
      const point = other as Point
      return math.equal(
        dot(point.vector, this.normal) - dot(this.position.vector, this.normal),
        0
      ) as boolean
    } else if (other instanceof Segment) {
      const segment = other as Segment
      return this.contains(segment.start) && this.contains(segment.end)
    } else if (other instanceof Line) {
      const line = other as Line
      return this.contains(line.position) && this.parallel(line)
    } else if (other instanceof Polygon) {
      const polygon = other as Polygon
      return this.equals(polygon.plane)
    }

    return false
  }

  translate(offset: Vector): Plane {
    this.position.translate(offset)
    return this
  }

  clone(): Plane {
    return new Plane(this.position, this.normal)
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
