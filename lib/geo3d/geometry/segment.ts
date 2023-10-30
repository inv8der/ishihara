import math from '../../math'
import Vector, { dot, add } from '../utils/vector'
import GeoBody from './body'
import Point from './point'
import Line from './line'

export default class Segment implements GeoBody {
  public start: Point
  public end: Point
  public line: Line

  /**
   * **Input:**
   * - Segment(Point,Point)
   * - Segment(Point,Vector)
   */
  constructor(p1: Point, p2: Point)
  constructor(point: Point, vector: Vector)
  constructor(a: Point, b: Point | Vector) {
    if (a instanceof Point && b instanceof Point) {
      if (a.equals(b)) {
        throw new Error('Cannot initialize a Segment with two identical Points')
      }
      this.line = new Line(a, b)
      this.start = a.clone()
      this.end = b.clone()
    } else if (a instanceof Point && b instanceof Vector) {
      if (math.equal(b.length(), 0)) {
        throw new Error(
          'Cannot initialize a Segment with the length of Vector is 0'
        )
      }
      this.line = new Line(a, b)
      this.start = a.clone()
      this.end = new Point(add(a.pv(), b))
    } else {
      throw new Error('Cannot create segment with type')
    }
  }

  equals(other: Segment): boolean {
    return (
      (this.start.equals(other.start) && this.end.equals(other.end)) ||
      (this.end.equals(other.start) && this.start.equals(other.end))
    )
  }

  contains(other: Point | Segment): boolean {
    /** Checks if a point lies on a segment */
    if (other instanceof Point) {
      const r1 = this.line.contains(other)
      const v = new Vector(this.start, this.end)
      const v1 = new Vector(this.start, other)
      if (math.equal(v1.length(), 0)) {
        return true
      } else {
        const relativeLength = dot(v1, v) / v.length() / v.length()
        return (
          r1 &&
          (math.larger(relativeLength, 0) as boolean) &&
          (math.smaller(relativeLength, 1) as boolean)
        )
      }
      // r1 = point in self.line
      // r2 = point.x >= (min(self.start_point.x,self.end_point.x) - get_eps())
      // r3 = point.x <= (max(self.start_point.x,self.end_point.x) + get_eps())
    } else if (other instanceof Segment) {
      return this.contains(other.start) && this.contains(other.end)
    }

    return false
  }

  // def __hash__(self):
  //     """return the hash value of the segment"""
  //     return hash(("Segment",
  //     hash(self.start_point) + hash(self.end_point),
  //     hash(self.start_point) * hash(self.end_point)
  //     ))

  move(v: Vector) {
    /** Return the Segment that you get when you move self by vector v, self is also moved */
    if (v instanceof Vector) {
      this.start.translate(v)
      this.end.translate(v)
      return this
    } else {
      throw new Error('The second parameter for move function must be Vector')
    }
  }

  translate(offset: Vector) {
    this.start.translate(offset)
    this.end.translate(offset)
    return this
  }

  length(): number {
    /** retutn the length of the segment */
    return this.start.distance(this.end)
  }
}
