import math from '../../math'
import Vector, { dot, cross, subtract } from '../utils/vector'
import Point from './point'
import Plane from './plane'
import Segment from './segment'
import HashSet from '../utils/hashset'

/**
 * Returns the area of the triangle composed by points a, b, and c using Heron's formula
 * @param pa
 * @param pb
 * @param pc
 * @returns
 */
function getTriangleArea(pa: Point, pb: Point, pc: Point): number {
  const a = pa.distance(pb)
  const b = pb.distance(pc)
  const c = pc.distance(pa)
  const p = (a + b + c) / 2
  return Math.sqrt(p * (p - a) * (p - b) * (p - c))
}

export default class Polygon {
  static Parallelogram(origin: Point, v1: Vector, v2: Vector) {
    /**
     * A special function for creating Parallelogram
     */
    if (v1.length() == 0 || v2.length() == 0) {
      throw new Error("The length for the two vector shouldn't be zero")
    } else if (v1.parallel(v2)) {
      throw new Error("The two vectors shouldn't be parallel to each other")
    } else {
      return new Polygon([
        origin,
        origin.clone().translate(v1),
        origin.clone().translate(v2),
        origin.clone().translate(v1).translate(v2),
      ])
    }
  }

  vertices: Point[]
  // segments: Segment[]
  plane: Plane
  center: Point

  /**
   * ConvexPolygons(points)
   * - points: a tuple of points.
   *
   * The points needn't to be in order.
   * The convexity should be guaranteed. This function **will not** check the convexity.
   * If the Polygon is not convex, there might be errors.
   */
  constructor(vertices: Point[], reverse = false) {
    const points = new HashSet<Point>()
    for (const point of vertices) {
      points.add(point.clone())
    }
    this.vertices = Array.from(points)
    this.center = this._getCenterPoint()

    if (this.vertices.length < 3) {
      throw new Error(
        'Cannot build a polygon with number of points smaller than 3'
      )
    }

    this.plane = new Plane(this.vertices[0], this.vertices[1], this.vertices[2])
    if (reverse) {
      this.plane.negate()
    }

    this._checkAndSortVertices()
  }

  private _checkAndSortVertices() {
    // This is only a weak check - passing doesn't guarantee it is a convex polygon
    const pointsByAngle = new Map<number, Point>()
    const normal = this.plane.normal.normalized()
    const v0 = new Vector(this.center, this.vertices[0]).normalized()
    const v1 = cross(normal, v0)

    for (const point of this.vertices) {
      if (!this.plane.contains(point)) {
        throw new Error(
          `Convex check failed because point (${[
            point.x,
            point.y,
            point.z,
          ]}) is not on plane`
        )
      }

      const pv = subtract(point.pv(), this.center.pv())
      const y = dot(pv, v0)
      const z = dot(pv, v1)
      let angle = Math.atan2(z, y)
      if (angle < 0) {
        angle += 2 * Math.PI
      }
      pointsByAngle.set(angle, point)
    }

    this.vertices = Array.from(pointsByAngle)
      .sort((a, b) => a[0] - b[0])
      .map(([, point]) => point)
  }

  private _getCenterPoint(): Point {
    let [x, y, z] = [0, 0, 0]
    const numPoints = this.vertices.length
    for (const point of this.vertices) {
      x += point.x
      y += point.y
      z += point.z
    }
    return new Point(x / numPoints, y / numPoints, z / numPoints)
  }

  equals(other: Polygon) {
    return (
      this.plane.equals(other.plane) &&
      this.vertices.every((point, i) => point.equals(other.vertices[i]))
    )
  }

  getHashCode() {
    return btoa(
      [
        'Polygon',
        this.plane.getHashCode(),
        ...this.vertices.map((v) => v.getHashCode()),
      ].join()
    )
  }

  clone(): Polygon {
    return new Polygon(this.vertices)
  }

  contains(other: Point | Segment): boolean {
    if (other instanceof Point) {
      // Requirement 1: the point is on the plane
      const r1 = this.plane.contains(other)

      // Requirement 2: the point is inside the polygon
      const normal = this.plane.normal.normalized()
      let r2 = true
      for (let i = 0; i < this.vertices.length; i += 1) {
        // Check if the point lies in the inside direction of every segment
        const j = i === this.vertices.length - 1 ? 0 : i + 1
        const v0 = new Vector(this.vertices[i], this.vertices[j])
        const v1 = cross(normal, v0)
        const vec = new Vector(this.vertices[i], other)

        if (math.smaller(dot(vec, v1), 0)) {
          r2 = false
          break
        }
      }
      return r1 && r2
    } else if (other instanceof Segment) {
      return this.contains(other.start) && this.contains(other.end)
    }

    return false
  }

  translate(offset: Vector): Polygon {
    this.vertices.forEach((point) => {
      point.translate(offset)
    })
    this.plane = new Plane(this.vertices[0], this.vertices[1], this.vertices[2])
    this.center = this._getCenterPoint()
    return this
  }

  *segments(): IterableIterator<Segment> {
    for (let i = 0; i < this.vertices.length; i += 1) {
      const j = i === this.vertices.length - 1 ? 0 : i + 1
      yield new Segment(this.vertices[i], this.vertices[j])
    }
  }

  negate(): Polygon {
    // Return the negative ConvexPolygon by reverting the normal
    const negative = new Polygon(this.vertices, true)
    this.vertices = negative.vertices
    this.plane = negative.plane
    this.center = negative.center
    return this
  }

  length() {
    /** return the total length of ConvexPolygon */
    let length = 0
    for (const segment of this.segments()) {
      length += segment.length()
    }
    return length
  }

  area() {
    let area = 0
    for (let i = 0; i < this.vertices.length; i += 1) {
      const index_0 = i
      let index_1
      if (i == this.vertices.length - 1) {
        index_1 = 0
      } else {
        index_1 = i + 1
      }
      area += getTriangleArea(
        this.center,
        this.vertices[index_0],
        this.vertices[index_1]
      )
    }
    return area
  }
}

export class Parallelogram extends Polygon {
  constructor(origin: Point, v1: Vector, v2: Vector) {
    if (v1.length() == 0 || v2.length() == 0) {
      throw new Error("The length for the two vector shouldn't be zero")
    } else if (v1.parallel(v2)) {
      throw new Error("The two vectors shouldn't be parallel to each other")
    }

    super([
      origin,
      origin.clone().translate(v1),
      origin.clone().translate(v2),
      origin.clone().translate(v1).translate(v2),
    ])
  }
}
