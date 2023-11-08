import math from '../../math'
import { Vector, dot, add, subtract } from '../utils/vector'
import { Point } from './point'
import { Line } from './line'

export class Segment {
  public start: Point
  public end: Point
  public line: Line

  constructor(start: Point, end: Point)
  constructor(point: Point, direction: Vector)
  constructor(a: Point, b: Point | Vector) {
    if (a instanceof Point && b instanceof Point) {
      if (a.equals(b)) {
        throw new Error('Cannot initialize Segment with two identical points')
      }
      this.line = new Line(a, b)
      this.start = a.clone()
      this.end = b.clone()
    } else if (a instanceof Point && b instanceof Vector) {
      if (math.equal(b.length(), 0)) {
        throw new Error(
          'Cannot initialize Segment with a direction vector of length 0'
        )
      }
      this.line = new Line(a, b)
      this.start = a.clone()
      this.end = new Point(add(a.toVector(), b))
    } else {
      throw new Error(
        `Cannot initialize Segment with parameters of type ${a.constructor.name} and ${b.constructor.name}`
      )
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
      const v = subtract(this.end.toVector(), this.start.toVector())
      const v1 = subtract(other.toVector(), this.start.toVector())
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

  clone(): Segment {
    return new Segment(this.start, this.end)
  }

  translate(offset: Vector): Segment {
    this.start.translate(offset)
    this.end.translate(offset)
    return this
  }
}
