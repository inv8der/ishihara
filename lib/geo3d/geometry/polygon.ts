import math from '../../math'
import HashSet from '../utils/hashset'
import { Vector, dot, cross, subtract } from '../utils/vector'
import { Point } from './point'
import { Plane } from './plane'
import { Segment } from './segment'
import type { Geometry } from './geometry'

export class Polygon implements Geometry<Polygon> {
  vertices: Point[]
  segments: Segment[]
  plane: Plane
  center: Point

  /**
   * The points needn't be in order, but the convexity should be guaranteed.
   * If the Polygon is not convex, there might be errors.
   */
  constructor(vertices: Point[]) {
    if (vertices.length < 3) {
      throw new Error('Cannot construct a polygon with fewer than 3 points')
    }

    const points = new HashSet<Point>()
    for (const point of vertices) {
      points.add(point.clone())
    }

    this.vertices = Array.from(points)
    this.plane = new Plane(this.vertices[0], this.vertices[1], this.vertices[2])
    this.center = this._getCenterPoint()

    this._checkAndSortVertices()

    // Only build segments after sorting the vertices
    this.segments = this._getSegments()
  }

  private _checkAndSortVertices() {
    const pointsByAngle = new Map<number, Point>()

    const v0 = subtract(this.vertices[0].vector, this.center.vector)
    const v1 = cross(this.plane.normal, v0)

    for (const point of this.vertices) {
      // This is only a weak check - passing doesn't guarantee a convex polygon
      if (!this.plane.contains(point)) {
        throw new Error(
          `Convex check failed because point (${[
            point.x,
            point.y,
            point.z,
          ]}) is not on plane`
        )
      }

      const pv = subtract(point.vector, this.center.vector)
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

  private _getSegments(): Segment[] {
    const segments = []
    for (let i = 0; i < this.vertices.length; i += 1) {
      const j = i === this.vertices.length - 1 ? 0 : i + 1
      segments.push(new Segment(this.vertices[i], this.vertices[j]))
    }
    return segments
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

  contains<T extends Geometry<T>>(other: T): boolean {
    if (other instanceof Point) {
      const point: Point = other

      // Requirement 1: point is on the plane
      const r1 = this.plane.contains(point)

      // Requirement 2: point is inside the polygon
      let r2 = true
      for (let i = 0; i < this.vertices.length; i += 1) {
        // Check if the point lies in the inside direction of every segment
        const j = i === this.vertices.length - 1 ? 0 : i + 1
        const v0 = subtract(this.vertices[j].vector, this.vertices[i].vector)
        const v1 = cross(this.plane.normal, v0)
        const vec = subtract(point.vector, this.vertices[i].vector)
        if (math.smaller(dot(vec, v1), 0)) {
          r2 = false
          break
        }
      }
      return r1 && r2
    } else if (other instanceof Segment) {
      const segment = other as Segment
      return this.contains(segment.start) && this.contains(segment.end)
    }

    return false
  }

  translate(offset: Vector): Polygon {
    this.vertices.forEach((point) => {
      point.translate(offset)
    })
    this.plane = new Plane(this.vertices[0], this.vertices[1], this.vertices[2])
    this.center = this._getCenterPoint()
    this.segments = this._getSegments()
    return this
  }

  clone(): Polygon {
    return new Polygon(this.vertices)
  }

  negate(): Polygon {
    // Negate the polygon by reverting the normal
    this.plane.negate()

    // Reverting the normal will reverse the sort order of the vertices. Since we know this
    // is a valid polygon, calling this_checkAndSortVertices() is unnecessary
    this.vertices.reverse()
    this.segments = this._getSegments()

    return this
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
