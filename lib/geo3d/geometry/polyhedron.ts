import math from '../../math'
import Vector, { dot } from '../utils/vector'
import HashSet from '../utils/hashset'
import Point from './point'
import Polygon from './polygon'
import Segment from './segment'

class Pyramid {
  public polygon: Polygon
  public point: Point

  constructor(polygon: Polygon, point: Point) {
    this.polygon = polygon
    this.point = point

    if (this.polygon.plane.contains(this.point)) {
      throw new Error('Cannot create Pyramid with point on the polygon plane')
    }
  }

  height() {
    /** return the height of the pyramid */
    const p0 = this.polygon.vertices[0]
    return Math.abs(
      dot(new Vector(p0, this.point), this.polygon.plane.normal.normalized())
    )
  }

  volume() {
    /** return the volume of the pryamid */
    const h = this.height()
    return (1 / 3) * h * this.polygon.area()
  }
}

export default class Polyhedron {
  /**
   * **Input:**
   * - convex_polygons: tuple of ConvexPolygons
   *
   * **Output:**
   * - ConvexPolyhedron
   *
   * The correctness of convex_polygons are checked According to Euler's formula.
   * The normal of the convex polygons are checked and corrected which should be toward the outer direction
   */

  static Parallelepiped(origin: Point, v1: Vector, v2: Vector, v3: Vector) {
    /**
     * A special function for creating Parallelepiped
     *
     * **Input:**
     * - base_point: a Point
     * - v1, v2, v3: three Vectors
     *
     * **Output:**
     * - A parallelepiped which is a ConvexPolyhedron instance.
     **/
    if (v1.length() == 0 || v2.length() == 0 || v3.length() == 0) {
      throw new Error("The length for the three vectors shouldn't be zero")
    } else if (v1.parallel(v2) || v1.parallel(v3) || v2.parallel(v3)) {
      throw new Error("The three vectors shouldn't be parallel to each other")
    } else {
      const diagonal = origin.clone().translate(v1).translate(v2).translate(v3)
      const rectangle0 = Polygon.Parallelogram(origin, v1, v2)
      const rectangle1 = Polygon.Parallelogram(origin, v2, v3)
      const rectangle2 = Polygon.Parallelogram(origin, v1, v3)
      const rectangle3 = Polygon.Parallelogram(
        diagonal,
        v1.clone().negate(),
        v2.clone().negate()
      )
      const rectangle4 = Polygon.Parallelogram(
        diagonal,
        v2.clone().negate(),
        v3.clone().negate()
      )
      const rectangle5 = Polygon.Parallelogram(
        diagonal,
        v1.clone().negate(),
        v3.clone().negate()
      )
      return new Polyhedron([
        rectangle0,
        rectangle1,
        rectangle2,
        rectangle3,
        rectangle4,
        rectangle5,
      ])
    }
  }

  polygons: Polygon[]
  vertices: Point[]
  segments: Segment[]
  pyramids: Pyramid[]
  center: Point

  constructor(polygons: Polygon[]) {
    this.polygons = polygons.map((polygon) => polygon.clone())
    this._sortPolygons()

    const pointSet = new HashSet<Point>()
    const segmentSet = new HashSet<Segment>()
    const pyramidSet = new HashSet<Pyramid>()

    for (const polygon of this.polygons) {
      for (const point of polygon.vertices) {
        pointSet.add(point.clone())
      }
      for (const segment of polygon.segments()) {
        // @todo add clone method to Segment
        segmentSet.add(segment)
      }
    }

    this.vertices = Array.from(pointSet)
    this.segments = Array.from(segmentSet)
    this.center = this._getCenterPoint()

    for (let i = 0; i < this.polygons.length; i += 1) {
      // Check if the normal if facing inwards, and if so, reverse it
      const polygon = this.polygons[i]
      const direction = dot(
        new Vector(this.center, polygon.plane.position),
        polygon.plane.normal
      )
      if (math.smaller(direction, 0)) {
        polygon.negate()
      }
      pyramidSet.add(new Pyramid(polygon, this.center))
    }

    this.pyramids = Array.from(pyramidSet)

    if (!this._checkNormal()) {
      throw new Error('Check Normal Fails For The Convex Polyhedron')
    }

    if (!this._checkEuler()) {
      throw new Error(
        'Check for the number of vertices, faces and edges fails, the polyhedron may not be closed'
      )
    }
  }

  private _getCenterPoint() {
    let [x, y, z] = [0, 0, 0]
    const numPoints = this.vertices.length
    for (const point of this.vertices) {
      x += point.x
      y += point.y
      z += point.z
    }
    return new Point(x / numPoints, y / numPoints, z / numPoints)
  }

  private _sortPolygons() {
    this.polygons = this.polygons.sort((a, b) => {
      if (a.center.z === b.center.z) {
        if (a.center.y === b.center.y) {
          return a.center.x - b.center.x
        } else {
          return a.center.y - b.center.y
        }
      }
      return a.center.z - b.center.z
    })
  }

  private _checkEuler() {
    const numVertices = this.vertices.length
    const numSegments = this.segments.length
    const numPolygons = this.polygons.length
    return numVertices - numSegments + numPolygons == 2
  }

  private _checkNormal() {
    /** return True if all the polygons' normals point to the outside */
    for (const polygon of this.polygons) {
      const direction = dot(
        new Vector(this.center, polygon.plane.position),
        polygon.plane.normal
      )
      if (math.smaller(direction, 0)) {
        return false
      }
    }
    return true
  }

  equals(other: Polyhedron): boolean {
    return this.polygons.every((_, i) =>
      this.polygons[i].equals(other.polygons[i])
    )
  }

  getHashCode(): string {
    return btoa(
      ['Polyhedron', ...this.polygons.map((p) => p.getHashCode()).sort()].join()
    )
  }

  contains(other: Point | Segment | Polygon): boolean {
    if (other instanceof Point) {
      for (const polygon of this.polygons) {
        const direction = new Vector(polygon.center, other)
        if (math.larger(dot(direction, polygon.plane.normal), 0)) {
          return false
        }
      }
      return true
    } else if (other instanceof Segment) {
      return this.contains(other.start) && this.contains(other.end)
    } else if (other instanceof Polygon) {
      for (const point of other.vertices) {
        if (!this.contains(point)) {
          return false
        }
      }
      return true
    }
    return false
  }

  translate(offset: Vector): Polyhedron {
    this.polygons.forEach((polygon) => {
      polygon.translate(offset)
    })

    const pointSet = new HashSet<Point>()
    const segmentSet = new HashSet<Segment>()
    const pyramidSet = new HashSet<Pyramid>()

    for (const polygon of this.polygons) {
      for (const point of polygon.vertices) {
        pointSet.add(point)
      }
      for (const segment of polygon.segments()) {
        segmentSet.add(segment)
      }
    }

    this.vertices = Array.from(pointSet)
    this.segments = Array.from(segmentSet)
    this.center = this._getCenterPoint()

    for (let i = 0; i < this.polygons.length; i += 1) {
      const polygon = this.polygons[i]
      const direction = dot(
        new Vector(this.center, polygon.plane.position),
        polygon.plane.normal
      )
      if (math.smaller(direction, 0)) {
        polygon.negate()
      }
      pyramidSet.add(new Pyramid(polygon, this.center))
    }

    this.pyramids = Array.from(pyramidSet)

    if (!this._checkNormal()) {
      throw new Error('Check Normal Fails For The Convex Polyhedron')
    }

    if (!this._checkEuler()) {
      throw new Error(
        'Check for the number of vertices, faces and edges fails, the polyhedron may not be closed'
      )
    }

    return this
  }

  length() {
    /** return the total length of the polyhedron */
    let length = 0
    for (const segment of this.segments) {
      length += segment.length()
    }
    return length
  }

  area() {
    /** return the total area of the polyhedron */
    let area = 0
    for (const polygon of this.polygons) {
      area += polygon.area()
    }
    return area
  }

  volume() {
    /** return the total volume of the polyhedron */
    let volume = 0
    for (const pyramid of this.pyramids) {
      volume += pyramid.volume()
    }
    return volume
  }
}

export class Parallelepiped extends Polyhedron {
  constructor(origin: Point, v1: Vector, v2: Vector, v3: Vector) {
    if (v1.length() == 0 || v2.length() == 0 || v3.length() == 0) {
      throw new Error("The length for the three vectors shouldn't be zero")
    } else if (v1.parallel(v2) || v1.parallel(v3) || v2.parallel(v3)) {
      throw new Error("The three vectors shouldn't be parallel to each other")
    }

    const diagonal = origin.clone().translate(v1).translate(v2).translate(v3)
    const rectangle0 = Polygon.Parallelogram(origin, v1, v2)
    const rectangle1 = Polygon.Parallelogram(origin, v2, v3)
    const rectangle2 = Polygon.Parallelogram(origin, v1, v3)
    const rectangle3 = Polygon.Parallelogram(
      diagonal,
      v1.clone().negate(),
      v2.clone().negate()
    )
    const rectangle4 = Polygon.Parallelogram(
      diagonal,
      v2.clone().negate(),
      v3.clone().negate()
    )
    const rectangle5 = Polygon.Parallelogram(
      diagonal,
      v1.clone().negate(),
      v3.clone().negate()
    )
    super([
      rectangle0,
      rectangle1,
      rectangle2,
      rectangle3,
      rectangle4,
      rectangle5,
    ])
  }
}
