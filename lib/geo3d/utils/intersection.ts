import math from '../../math'
import Point from '../geometry/point'
import Segment from '../geometry/segment'
import Line from '../geometry/line'
import Plane from '../geometry/plane'
import Polygon from '../geometry/polygon'
import Polyhedron from '../geometry/polyhedron'
import Vector, { multiply, add, dot, cross } from './vector'
import HashSet from './hashset'

/**
 * Returns the length of vector v1 projected onto v2
 * @param v1
 * @param v2
 */
function getProjectionLength(v1: Vector, v2: Vector): number {
  return dot(v1, v2) / v2.length()
}

/**
 * Returns the ratio of the length of vector v1 projected onto v2 and the length of v2
 * @param v1
 * @param v2
 */
function getRelativeProjectionLength(v1: Vector, v2: Vector): number {
  return getProjectionLength(v1, v2) / v2.length()
}

/**
 * Returns the longest segment between points or null if one cannot be found
 * (ie. the number of points is less than 2)
 * @param points
 */
function findLongestSegment(points: Point[]): Segment | null {
  if (points.length < 2) {
    return null
  }

  const p0 = points[0]
  const p1 = points[1]
  const v0 = new Vector(p0, p1)
  const relativeLengths = [0, 1]

  for (let i = 2; i < points.length; i += 1) {
    const pi = points[i]
    const vi = new Vector(p0, pi)
    if (!vi.parallel(v0)) {
      throw new Error('The points are not on a line')
    }
    relativeLengths.push(getRelativeProjectionLength(vi, v0))
  }

  const start = p0.clone().translate(multiply(v0, Math.min(...relativeLengths)))
  const end = p0.clone().translate(multiply(v0, Math.max(...relativeLengths)))
  return new Segment(start, end)
}

function arePointsCollinear(points: Point[]): boolean {
  if (points.length < 3) {
    return true
  }

  const line = new Line(points[0], points[1])
  for (let i = 2; i < points.length; i += 1) {
    if (!line.contains(points[i])) {
      return false
    }
  }

  return true
}

export function intersectPointPoint(a: Point, b: Point): Point | null {
  return a.equals(b) ? a : null
}

export function intersectPointLine(a: Point, b: Line): Point | null {
  return b.contains(a) ? a : null
}

export function intersectPointPlane(a: Point, b: Plane): Point | null {
  return b.contains(a) ? a : null
}

export function intersectPointSegment(a: Point, b: Segment): Point | null {
  return b.contains(a) ? a : null
}

export function intersectPointPolygon(a: Point, b: Polygon): Point | null {
  return b.contains(a) ? a : null
}

export function intersectPointPolyhedron(
  a: Point,
  b: Polyhedron
): Point | null {
  return b.contains(a) ? a : null
}

export function intersectLineLine(a: Line, b: Line): Line | Point | null {
  if (a.equals(b)) {
    return a
  } else {
    try {
      // For the line-line intersection, we have to solve:
      //   s1 + λ u1 = t1 + μ v1
      //   s2 + λ u2 = t2 + μ v2
      //   s3 + λ u3 = t3 + μ v3
      // Rearrange a bit, and you get this system of equations in the form Ax = B.
      let A = [
        [a.direction[0], -b.direction[0], 0],
        [a.direction[1], -b.direction[1], 0],
        [a.direction[2], -b.direction[2], 0],
      ]
      let B = [
        b.position[0] - a.position[0],
        b.position[1] - a.position[1],
        b.position[2] - a.position[2],
      ]

      // Use bignumber for higher precision
      A = math.map(A, (x) => math.bignumber(x))
      B = math.map(B, (x) => math.bignumber(x))

      // We can use math.lusolve to solve for x (the column vector containing λ and μ)
      // Just need to pick one and plug it into the right equation.
      const solution = math.map(math.lusolve(A, B), (x) => math.number(x))
      const [lambda] = math.flatten(solution) as number[]

      // Could've chosen b.sv + mu * b.dv instead, but it doesn't matter as they
      // will point (pun intended) to the same point.
      return new Point(add(a.position, multiply(lambda, a.direction)))
    } catch (e) {
      // No intersection
      return null
    }
  }
}

export function intersectLinePlane(a: Line, b: Plane): Line | Point | null {
  // The line can be contained in the plane, in this case the whole line is the intersection
  if (b.contains(a)) {
    return a
  }
  // If they are parallel, there is no intersection
  else if (b.parallel(a)) {
    return null
  }
  // Given the plane in general form, if we insert the line coordinate by coordinate we get
  // a (s1 + μ u1) + b (s2 + μ u2) + c (s3 + μ u3) = d
  // where s is the position vector of the line
  //       u is the direction vector of the line
  //       μ is the parameter
  // Rearrange and solve for the parameter
  const mu =
    (dot(b.normal, b.position.pv()) - dot(b.normal, a.position)) /
    dot(b.normal, a.direction)
  return new Point(add(a.position, multiply(mu, a.direction)))
}

export function intersectLineSegment(
  a: Line,
  b: Segment
): Segment | Point | null {
  const intersection = intersectLineLine(a, b.line)
  if (intersection instanceof Line) {
    return b
  } else if (intersection instanceof Point) {
    return intersectPointSegment(intersection, b)
  }

  return null
}

export function intersectLinePolygon(
  a: Line,
  b: Polygon
): Segment | Point | null {
  const interection = intersectLinePlane(a, b.plane)
  if (interection instanceof Line) {
    const pointSet = new HashSet<Point>()
    for (const segment of b.segments()) {
      const interection = intersectLineSegment(a, segment)
      if (interection === null) {
        continue
      } else if (interection instanceof Point) {
        pointSet.add(interection)
      } else if (interection instanceof Segment) {
        return interection
      }
    }
    const points = Array.from(pointSet)
    if (points.length === 1) {
      return points[0]
    } else if (points.length === 2) {
      return new Segment(points[0], points[1])
    } else if (points.length >= 3) {
      throw new Error(
        'Bug detected! Line and Polygon should never have more than 2 intersection points'
      )
    }
  } else if (interection instanceof Point) {
    return intersectPointPolygon(interection, b)
  }

  return null
}

export function intersectLinePolyhedron(
  a: Line,
  b: Polyhedron
): Segment | Point | null {
  const pointSet = new HashSet<Point>()
  for (const polygon of b.polygons) {
    const intersection = intersectLinePolygon(a, polygon)
    if (intersection instanceof Segment) {
      return intersection
    } else if (intersection instanceof Point) {
      pointSet.add(intersection)
    }
  }

  const points = Array.from(pointSet)
  if (points.length === 1) {
    return points[0]
  } else if (points.length >= 2) {
    return findLongestSegment(points)
  }

  return null
}

export function intersectPlanePlane(a: Plane, b: Plane): Plane | Line | null {
  // If you solve:
  //   a x1 + b x2 + c x3 = d
  //   e x1 + f x2 + g x3 = h
  // You will get infinitely many solutions (if the planes are intersecting). All those
  // solutions are points on the intersection line. So we just chose two solutions
  // (i.e. two points), and lay a line through both of these.
  if (a.equals(b)) {
    return a
  } else if (a.normal.parallel(b.normal)) {
    // I think this case isn't needed. The else statement computes an auxillary line
    // that will be parallel to the plane if a and b are parallel. In that case,
    // intersectLinePlane returns a Line, which causes this function to return null
    return null
  } else {
    const direction = a.normal.cross(b.normal).normalized()
    const auxillaryLine = new Line(
      a.position,
      cross(direction, a.normal).normalized()
    )
    const intersection = intersectLinePlane(auxillaryLine, b)
    if (intersection instanceof Point) {
      return new Line(intersection, direction)
    }
  }

  return null
}

export function intersectPlaneSegment(
  a: Plane,
  b: Segment
): Segment | Point | null {
  const intersection = intersectLinePlane(b.line, a)
  if (intersection instanceof Point) {
    return intersectPointSegment(intersection, b)
  } else if (intersection instanceof Line) {
    return b
  }

  return null
}

export function intersectPlanePolygon(
  a: Plane,
  b: Polygon
): Polygon | Segment | Point | null {
  const intersection = intersectPlanePlane(a, b.plane)
  if (intersection === null) {
    return null
  } else if (intersection instanceof Plane) {
    return b
  } else if (intersection instanceof Line) {
    return intersectLinePolygon(intersection, b)
  }

  return null
}

export function intersectPlanePolyhedron(
  a: Plane,
  b: Polyhedron
): Polygon | Segment | Point | null {
  // check cpgs first, if no cpg on the face next or the intersection is the cpg
  // check segments, if any intersection is segment, then return segment.
  // if no intersection is segment and cpg, then calculate the point_set and calculate the intersection cpg
  for (const polygon of b.polygons) {
    if (a.contains(polygon)) {
      return polygon
    }
  }

  const pointSet = new HashSet<Point>()
  for (const segment of b.segments) {
    const intersection = intersectPlaneSegment(a, segment)
    if (intersection instanceof Point) {
      pointSet.add(intersection)
    }
  }

  const points = Array.from(pointSet)
  if (points.length === 1) {
    return points[0]
  } else if (points.length === 2) {
    return new Segment(points[0], points[1])
  } else if (points.length >= 3) {
    return new Polygon(points)
  }

  return null
}

export function intersectSegmentSegment(
  a: Segment,
  b: Segment
): Segment | Point | null {
  if (a.line.equals(b.line)) {
    const pointSet = new HashSet<Point>()
    if (b.contains(a.start)) {
      pointSet.add(a.start)
    }
    if (b.contains(a.end)) {
      pointSet.add(a.end)
    }
    if (a.contains(b.start)) {
      pointSet.add(b.start)
    }
    if (a.contains(b.end)) {
      pointSet.add(b.end)
    }
    const points = Array.from(pointSet)
    if (points.length === 1) {
      return points[0]
    } else if (points.length === 2) {
      return new Segment(points[0], points[1])
    }
  } else {
    const intersection = intersectLineLine(a.line, b.line)
    if (intersection instanceof Point) {
      if (a.contains(intersection) && b.contains(intersection)) {
        return intersection
      }
    }
  }

  return null
}

export function intersectSegmentPolygon(
  a: Segment,
  b: Polygon
): Segment | Point | null {
  const intersection = intersectLinePlane(a.line, b.plane)
  if (intersection instanceof Point) {
    if (a.contains(intersection) && b.contains(intersection)) {
      return intersection
    }
  } else if (intersection instanceof Line) {
    const intersection = intersectLinePolygon(a.line, b)
    if (intersection === null) {
      return null
    } else if (intersection instanceof Point) {
      return intersectPointSegment(intersection, a)
    } else if (intersection instanceof Segment) {
      return intersectSegmentSegment(intersection, a)
    }
  }

  return null
}

export function intersectSegmentPolyhedron(
  a: Segment,
  b: Polyhedron
): Segment | Point | null {
  if (b.contains(a.start) && b.contains(a.end)) {
    return a
  }

  const pointSet = new HashSet<Point>()
  for (const polygon of b.polygons) {
    const intersection = intersectSegmentPolygon(a, polygon)
    if (intersection instanceof Point) {
      pointSet.add(intersection)
    }
  }
  for (const segment of b.segments) {
    const intersection = intersectSegmentSegment(a, segment)
    if (intersection instanceof Point) {
      pointSet.add(intersection)
    }
  }
  if (b.contains(a.start) && !b.contains(a.end)) {
    pointSet.add(a.start)
  } else if (!b.contains(a.start) && b.contains(a.end)) {
    pointSet.add(a.end)
  }

  const points = Array.from(pointSet)
  if (points.length === 1) {
    return points[0]
  } else if (points.length === 2) {
    return new Segment(points[0], points[1])
  } else if (points.length >= 3) {
    throw new Error(
      'Bug detected! Segment and Polyhedron should never have more than 2 intersection points'
    )
  }

  return null
}

export function intersectPolygonPolygon(
  a: Polygon,
  b: Polygon
): Polygon | Segment | Point | null {
  const intersection = intersectPlanePlane(a.plane, b.plane)
  if (intersection instanceof Line) {
    const i1 = intersectLinePolygon(intersection, a)
    const i2 = intersectLinePolygon(intersection, b)
    if (i1 instanceof Segment && i2 instanceof Segment) {
      return intersectSegmentSegment(i1, i2)
    } else if (i1 instanceof Segment && i2 instanceof Point) {
      return intersectPointSegment(i2, i1)
    } else if (i1 instanceof Point && i2 instanceof Segment) {
      return intersectPointSegment(i1, i2)
    } else if (i1 instanceof Point && i2 instanceof Point) {
      return intersectPointPoint(i1, i2)
    }
  } else if (intersection instanceof Plane) {
    const pointSet = new HashSet<Point>()
    for (const point of a.vertices) {
      if (b.contains(point)) {
        pointSet.add(point)
      }
    }
    for (const point of b.vertices) {
      if (a.contains(point)) {
        pointSet.add(point)
      }
    }
    for (const sa of a.segments()) {
      for (const sb of b.segments()) {
        const intersection = intersectSegmentSegment(sa, sb)
        if (intersection instanceof Point) {
          pointSet.add(intersection)
        }
      }
    }
    const points = Array.from(pointSet)
    if (points.length === 0) {
      return null
    } else if (points.length === 1) {
      return points[0]
    } else if (points.length === 2) {
      return new Segment(points[0], points[1])
    } else if (points.length >= 3) {
      if (arePointsCollinear(points)) {
        throw new Error('Bug detected! please contact the author')
      }
      return new Polygon(points)
    }
  }

  return null
}

export function intersectPolygonPolyhedron(
  a: Polygon,
  b: Polyhedron
): Polygon | Segment | Point | null {
  const intersection = intersectPlanePolyhedron(a.plane, b)
  if (intersection instanceof Point) {
    return intersectPointPolygon(intersection, a)
  } else if (intersection instanceof Segment) {
    return intersectSegmentPolygon(intersection, a)
  } else if (intersection instanceof Polygon) {
    return intersectPolygonPolygon(intersection, a)
  }

  return null
}

export function intersectPolyhedronPolyhedron(
  a: Polyhedron,
  b: Polyhedron
): Polyhedron | Polygon | Segment | Point | null {
  const polygonSet = new HashSet<Polygon>()
  const segmentSet = new HashSet<Segment>()
  const pointSet = new HashSet<Point>()

  for (const polygon of a.polygons) {
    const intersection = intersectPolygonPolyhedron(polygon, b)
    if (intersection instanceof Point) {
      pointSet.add(intersection)
    } else if (intersection instanceof Segment) {
      segmentSet.add(intersection)
    } else if (intersection instanceof Polygon) {
      polygonSet.add(intersection)
    }
  }

  for (const polygon of b.polygons) {
    const intersection = intersectPolygonPolyhedron(polygon, a)
    if (intersection instanceof Point) {
      pointSet.add(intersection)
    } else if (intersection instanceof Segment) {
      segmentSet.add(intersection)
    } else if (intersection instanceof Polygon) {
      polygonSet.add(intersection)
    }
  }

  const polygons = Array.from(polygonSet)
  const segments = Array.from(segmentSet)
  const points = Array.from(pointSet)
  if (polygons.length > 1) {
    return new Polyhedron(polygons)
  } else if (polygons.length === 1) {
    return polygons[0]
  } else if (segments.length > 1) {
    throw new Error('Bug detected! please contact the author')
  } else if (segments.length === 1) {
    return segments[0]
  } else if (points.length > 1) {
    throw new Error('Bug detected! please contact the author')
  } else if (points.length === 1) {
    return points[0]
  }

  return null
}

export function intersection(a: Point, b: Point): Point | null
export function intersection(a: Point, b: Line): Point | null
export function intersection(a: Line, b: Point): Point | null
export function intersection(a: Point, b: Plane): Point | null
export function intersection(a: Plane, b: Point): Point | null
export function intersection(a: Point, b: Segment): Point | null
export function intersection(a: Segment, b: Point): Point | null
export function intersection(a: Point, b: Polygon): Point | null
export function intersection(a: Polygon, b: Point): Point | null
export function intersection(a: Point, b: Polyhedron): Point | null
export function intersection(a: Polyhedron, b: Point): Point | null
export function intersection(a: Line, b: Line): Point | Line | null
export function intersection(a: Line, b: Plane): Point | Line | null
export function intersection(a: Plane, b: Line): Point | Line | null
export function intersection(a: Line, b: Segment): Point | Segment | null
export function intersection(a: Segment, b: Line): Point | Segment | null
export function intersection(a: Line, b: Polygon): Point | Segment | null
export function intersection(a: Polygon, b: Line): Point | Segment | null
export function intersection(a: Line, b: Polyhedron): Point | Segment | null
export function intersection(a: Plane, b: Plane): Line | Plane | null
export function intersection(a: Plane, b: Segment): Segment | Point | null
export function intersection(a: Segment, b: Plane): Segment | Point | null
export function intersection(a: Segment, b: Polygon): Segment | Point | null
export function intersection(a: Polygon, b: Segment): Segment | Point | null
export function intersection(a: Segment, b: Polyhedron): Segment | Point | null
export function intersection(a: Polyhedron, b: Segment): Segment | Point | null
export function intersection(
  a: Polygon,
  b: Polygon
): Polygon | Segment | Point | null
export function intersection(
  a: Polygon,
  b: Polyhedron
): Polygon | Segment | Point | null
export function intersection(
  a: Polyhedron,
  b: Polygon
): Polygon | Segment | Point | null
export function intersection(
  a: Polyhedron,
  b: Polyhedron
): Polyhedron | Polygon | Segment | Point | null
export function intersection(
  a: Point | Line | Plane | Segment | Polygon | Polyhedron,
  b: Point | Line | Plane | Segment | Polygon | Polyhedron
): Point | Line | Plane | Segment | Polygon | Polyhedron | null {
  if (a instanceof Point && b instanceof Point) {
    return intersectPointPoint(a, b)
  } else if (a instanceof Point && b instanceof Line) {
    return intersectPointLine(a, b)
  } else if (a instanceof Line && b instanceof Point) {
    return intersectPointLine(b, a)
  } else if (a instanceof Point && b instanceof Plane) {
    return intersectPointPlane(a, b)
  } else if (a instanceof Plane && b instanceof Point) {
    return intersectPointPlane(b, a)
  } else if (a instanceof Point && b instanceof Segment) {
    return intersectPointSegment(a, b)
  } else if (a instanceof Segment && b instanceof Point) {
    return intersectPointSegment(b, a)
  } else if (a instanceof Point && b instanceof Polygon) {
    return intersectPointPolygon(a, b)
  } else if (a instanceof Polygon && b instanceof Point) {
    return intersectPointPolygon(b, a)
  } else if (a instanceof Point && b instanceof Polyhedron) {
    return intersectPointPolyhedron(a, b)
  } else if (a instanceof Polyhedron && b instanceof Point) {
    return intersectPointPolyhedron(b, a)
  } else if (a instanceof Line && b instanceof Line) {
    return intersectLineLine(a, b)
  } else if (a instanceof Line && b instanceof Plane) {
    return intersectLinePlane(a, b)
  } else if (a instanceof Plane && b instanceof Line) {
    return intersectLinePlane(b, a)
  } else if (a instanceof Line && b instanceof Segment) {
    return intersectLineSegment(a, b)
  } else if (a instanceof Segment && b instanceof Line) {
    return intersectLineSegment(b, a)
  } else if (a instanceof Line && b instanceof Polygon) {
    return intersectLinePolygon(a, b)
  } else if (a instanceof Polygon && b instanceof Line) {
    return intersectLinePolygon(b, a)
  } else if (a instanceof Line && b instanceof Polyhedron) {
    return intersectLinePolyhedron(a, b)
  } else if (a instanceof Polyhedron && b instanceof Line) {
    return intersectLinePolyhedron(b, a)
  } else if (a instanceof Plane && b instanceof Plane) {
    return intersectPlanePlane(a, b)
  } else if (a instanceof Plane && b instanceof Segment) {
    return intersectPlaneSegment(a, b)
  } else if (a instanceof Segment && b instanceof Plane) {
    return intersectPlaneSegment(b, a)
  } else if (a instanceof Plane && b instanceof Polygon) {
    return intersectPlanePolygon(a, b)
  } else if (a instanceof Polygon && b instanceof Plane) {
    return intersectPlanePolygon(b, a)
  } else if (a instanceof Plane && b instanceof Polyhedron) {
    return intersectPlanePolyhedron(a, b)
  } else if (a instanceof Polyhedron && b instanceof Plane) {
    return intersectPlanePolyhedron(b, a)
  } else if (a instanceof Segment && b instanceof Segment) {
    return intersectSegmentSegment(a, b)
  } else if (a instanceof Segment && b instanceof Polygon) {
    return intersectSegmentPolygon(a, b)
  } else if (a instanceof Polygon && b instanceof Segment) {
    return intersectSegmentPolygon(b, a)
  } else if (a instanceof Segment && b instanceof Polyhedron) {
    return intersectSegmentPolyhedron(a, b)
  } else if (a instanceof Polyhedron && b instanceof Segment) {
    return intersectSegmentPolyhedron(b, a)
  } else if (a instanceof Polygon && b instanceof Polygon) {
    return intersectPolygonPolygon(a, b)
  } else if (a instanceof Polygon && b instanceof Polyhedron) {
    return intersectPolygonPolyhedron(a, b)
  } else if (a instanceof Polyhedron && b instanceof Polygon) {
    return intersectPolygonPolyhedron(b, a)
  } else if (a instanceof Polyhedron && b instanceof Polyhedron) {
    return intersectPolyhedronPolyhedron(a, b)
  }

  return null
}
