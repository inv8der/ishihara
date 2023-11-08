import math from '../../math'
import HashSet from '../utils/hashset'
import { Vector, dot, subtract } from '../utils/vector'
import { Point } from './point'
import { Polygon, Parallelogram } from './polygon'
import { Segment } from './segment'

export class Polyhedron {
  polygons: Polygon[]
  vertices: Point[]
  segments: Segment[]
  center: Point

  /**
   * The normal of each polygon is checked and corrected so that all surfaces face outward.
   * Additionaly, Euler's formula is used to verify that the polyhedron is a closed shape.
   */
  constructor(polygons: Polygon[]) {
    this.polygons = polygons.map((polygon) => polygon.clone())
    this._sortPolygons()

    const pointSet = new HashSet<Point>()
    const segmentSet = new HashSet<Segment>()

    for (const polygon of this.polygons) {
      for (const point of polygon.vertices) {
        pointSet.add(point.clone())
      }
      for (const segment of polygon.segments) {
        segmentSet.add(segment.clone())
      }
    }

    this.vertices = Array.from(pointSet)
    this.segments = Array.from(segmentSet)
    this.center = this._getCenterPoint()

    for (let i = 0; i < this.polygons.length; i += 1) {
      // Check if the normal if facing inwards, and if so, reverse it
      const polygon = this.polygons[i]
      const direction = dot(
        subtract(polygon.plane.position.toVector(), this.center.toVector()),
        polygon.plane.normal
      )
      if (math.smaller(direction, 0)) {
        polygon.negate()
      }
    }

    if (!this._checkNormal()) {
      throw new Error('One or more sides of the polyhedron faces inward')
    }

    if (!this._checkEuler()) {
      throw new Error(
        'Check for the number of vertices, faces, and edges failed. The polyhedron may not be closed'
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
    // Returns true if all the polygons' normals point to the outside
    for (const polygon of this.polygons) {
      const direction = dot(
        subtract(polygon.plane.position.toVector(), this.center.toVector()),
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
        const direction = subtract(other.toVector(), polygon.center.toVector())
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

    for (const polygon of this.polygons) {
      for (const point of polygon.vertices) {
        pointSet.add(point)
      }
      for (const segment of polygon.segments) {
        segmentSet.add(segment)
      }
    }

    this.vertices = Array.from(pointSet)
    this.segments = Array.from(segmentSet)
    this.center = this._getCenterPoint()

    return this
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
    const rectangle0 = new Parallelogram(origin, v1, v2)
    const rectangle1 = new Parallelogram(origin, v2, v3)
    const rectangle2 = new Parallelogram(origin, v1, v3)
    const rectangle3 = new Parallelogram(
      diagonal,
      v1.clone().negate(),
      v2.clone().negate()
    )
    const rectangle4 = new Parallelogram(
      diagonal,
      v2.clone().negate(),
      v3.clone().negate()
    )
    const rectangle5 = new Parallelogram(
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
