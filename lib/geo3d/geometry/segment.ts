import math from '../../math'
import { Vector, dot, add, subtract } from '../utils/vector'
import { Point } from './point'
import { Line } from './line'
import type { Geometry } from './geometry'

export class Segment implements Geometry<Segment> {
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
      if (math.absEqual(b.length(), 0)) {
        throw new Error(
          'Cannot initialize Segment with a direction vector of length 0'
        )
      }
      this.line = new Line(a, b)
      this.start = a.clone()
      this.end = new Point(add(a.vector, b))
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

  contains<T extends Geometry<T>>(other: T): boolean {
    if (other instanceof Point) {
      const point = other as Point
      const v = subtract(this.end.vector, this.start.vector)
      const v1 = subtract(point.vector, this.start.vector)
      if (math.absEqual(v1.length(), 0)) {
        return true
      } else {
        const relativeLength = dot(v1, v) / v.length() / v.length()
        return (
          this.line.contains(point) &&
          (math.absLarger(relativeLength, 0) as boolean) &&
          (math.absSmaller(relativeLength, 1) as boolean)
        )
      }
    } else if (other instanceof Segment) {
      const segment = other as Segment
      return this.contains(segment.start) && this.contains(segment.end)
    }

    return false
  }

  translate(offset: Vector): Segment {
    this.start.translate(offset)
    this.end.translate(offset)
    return this
  }

  clone(): Segment {
    return new Segment(this.start, this.end)
  }
}
