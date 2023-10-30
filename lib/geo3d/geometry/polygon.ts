import math from '../../math'
import Vector, { dot, cross, subtract } from '../utils/vector'
import Point from './point'
import Plane from './plane'
import GeoBody from './body'
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

function getCenterPoint(points: Point[]) {
  let [x, y, z] = [0, 0, 0]
  const numPoints = points.length
  for (const point of points) {
    x += point.x
    y += point.y
    z += point.z
  }
  return new Point(x / numPoints, y / numPoints, z / numPoints)
}

// function sortVertices(center: Point, normal: Vector, vertices: Point[]) {
//   const v0 = new Vector(center, vertices[0]).normalized()
//   const v1 = cross(normal, v0)

//   const pointsByAngle = new Map<number, Point>()

//   for (const point of vertices) {
//     const pv = subtract(point.pv(), center.pv())
//     const y = dot(pv, v0)
//     const z = dot(pv, v1)
//     // the range of vector_angle is [0,2*pi)
//     let angle = Math.atan2(z, y)
//     if (angle < 0) {
//       angle += 2 * Math.PI
//     }
//     pointsByAngle.set(angle, point)
//   }

//   return Array.from(pointsByAngle)
//     .sort((a, b) => a[0] - b[0])
//     .map(([, point]) => point)
// }

export default class Polygon implements GeoBody {
  /**
   * ConvexPolygons(points)
   * - points: a tuple of points.
   *
   * The points needn't to be in order.
   * The convexity should be guaranteed. This function **will not** check the convexity.
   * If the Polygon is not convex, there might be errors.
   */

  vertices: Point[]
  plane: Plane
  center: Point

  static Parallelogram(origin: Point, v1: Vector, v2: Vector) {
    /**
     * A special function for creating Parallelogram
     *
     * **Input:**
     * - base_point: a Point
     * - v1, v2: two Vectors
     *
     * **Output:**
     * - A parallelogram which is a ConvexPolygon instance.
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

  constructor(vertices: Point[], reverse = false) {
    // merge same points
    const points = new HashSet<Point>()
    for (const point of vertices) {
      points.add(point.clone())
    }
    this.vertices = Array.from(points)

    if (this.vertices.length < 3) {
      throw new Error(
        'Cannot build a polygon with number of points smaller than 3'
      )
    }

    this.plane = new Plane(this.vertices[0], this.vertices[1], this.vertices[2])
    if (reverse) {
      this.plane.negate()
    }

    this.center = getCenterPoint(this.vertices)

    this._check_and_sort_points()
  }

  *segments(): IterableIterator<Segment> {
    for (let i = 0; i < this.vertices.length; i += 1) {
      const j = i === this.vertices.length - 1 ? 0 : i + 1
      yield new Segment(this.vertices[i], this.vertices[j])
    }
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

  _check_and_sort_points() {
    /**
     * **Input:**
     * - self
     *
     * **Output:**
     * - True for check passed
     * - False for check not passed
     *
     * This is only a **weak** check, passing the check doesn't guarantee it is a convex polygon
     */

    const normal = this.plane.normal.normalized()
    const v0 = new Vector(this.center, this.vertices[0]).normalized()
    const v1 = normal.cross(v0)

    const pointsByAngle = new Map<number, Point>()
    for (const point of this.vertices) {
      if (!this.plane.contains(point)) {
        throw new Error(
          `Convex Check Fails Because point ${[
            point.x,
            point.y,
            point.z,
          ]} is not on plane`
        )
      }
      const pv = subtract(point.pv(), this.center.pv()) // point.pv() - this.center_point.pv()
      const y = dot(pv, v0) // pv * v0
      const z = dot(pv, v1) // pv * v1
      // the range of vector_angle is [0,2*pi)
      let angle = Math.atan2(z, y)
      if (angle < 0) {
        angle += 2 * Math.PI
      }
      pointsByAngle.set(angle, point)
    }

    const points = Array.from(pointsByAngle)
      .sort((a, b) => a[0] - b[0])
      .map(([, point]) => point)

    this.vertices = points

    return true
  }

  contains(other: Point | Segment): boolean {
    /** Checks if a point or segment lies in a ConvexPolygon */
    if (other instanceof Point) {
      // requirement 1: the point is on the plane
      const r1 = this.plane.contains(other)

      // requirement 2: the point is inside the polygon
      const normal = this.plane.normal.normalized()
      let r2 = true
      for (let i = 0; i < this.vertices.length; i += 1) {
        // check if the point lies in the inside direction of every segment
        const j = i === this.vertices.length - 1 ? 0 : i + 1
        const v0 = new Vector(this.vertices[i], this.vertices[j])
        const v1 = cross(normal, v0)
        const vec = new Vector(this.vertices[i], other)

        // vec.multiply(v1) < -get_eps()
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

  //   equals(other: Polygon) {
  //     return hash(this) == hash(other)
  //   }

  // _get_point_hash_sum() {
  //     /** return the sum of hash of all points */
  //     let hash_sum = 0
  //     for (const point of this.points) {
  //         hash_sum += hash(point)
  //     }
  //     return hash_sum
  // }

  // the hash function is not accurate
  // in some extreme case, this function may fail
  // which means it's vulnerable to attacks.
  // __hash__() {
  //     /** return the has of the convexpolygon */
  //     return hash([
  //         "ConvexPolygon",
  //         round(this._get_point_hash_sum(),SIG_FIGURES),
  //         hash(this.plane) + hash(-this.plane),
  //         hash(this.plane) * hash(-this.plane)
  //     ])
  // }

  // eq_with_normal(other) {
  //     /** return whether self equals with other considering the normal */
  //     if (other instanceof ConvexPolygon) {
  //         return (this.hash_with_normal() == other.hash_with_normal())
  //     } else {
  //         return false
  //     }
  // }

  // hash_with_normal() {
  //     /** return the hash value considering the normal */
  //     return hash([
  //         "ConvexPolygon",
  //         round(this._get_point_hash_sum(),SIG_FIGURES-5),
  //         hash(this.plane)
  //     ])
  // }

  negate(): Polygon {
    /** return the negative ConvexPolygon by reverting the normal */
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

  translate(offset: Vector): Polygon {
    this.vertices.forEach((point) => {
      point.translate(offset)
    })
    this.plane = new Plane(this.vertices[0], this.vertices[1], this.vertices[2])
    this.center = getCenterPoint(this.vertices)
    return this
  }

  clone() {
    return new Polygon(this.vertices)
  }
}
