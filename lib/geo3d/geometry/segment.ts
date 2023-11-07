import math from '../../math'
import Vector, { dot, add } from '../utils/vector'
import Point from './point'
import Line from './line'

export default class Segment {
  public start: Point
  public end: Point
  public line: Line

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

  getHashCode() {
    return btoa(
      [
        'Segment',
        ...[this.start.getHashCode(), this.end.getHashCode()].sort(),
      ].join()
    )
  }

  contains(other: Point | Segment): boolean {
    if (other instanceof Point) {
      const v = new Vector(this.start, this.end)
      const v1 = new Vector(this.start, other)
      if (math.equal(v1.length(), 0)) {
        return true
      } else {
        const relativeLength = dot(v1, v) / v.length() / v.length()
        return (
          this.line.contains(other) &&
          (math.larger(relativeLength, 0) as boolean) &&
          (math.smaller(relativeLength, 1) as boolean)
        )
      }
      // r1 = this.line.contains(other)
      // r2 = math.larger(other.x, math.min(this.start.x, this.end.x))
      // r3 = math.smaller(other.x, math.max(this.start.x, this.end.x))
    } else if (other instanceof Segment) {
      return this.contains(other.start) && this.contains(other.end)
    }

    return false
  }

  translate(offset: Vector): Segment {
    this.start.translate(offset)
    this.end.translate(offset)
    return this
  }

  length(): number {
    return this.start.distance(this.end)
  }
}
