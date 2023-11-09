import type { Vector } from '../utils/vector'

// export default class GeoBody {
//     /**
//      * A base class for geometric objects that provides some common
//      * methods to work with. In the end, everything is dispatched to
//      * Geometry3D.calc.calc.* anyway, but it sometimes feels nicer to write it like
//      * L1.intersection(L2) instead of intersection(L1, L2)
//      */
//     intersection(other) {
//         /** return the intersection between self and other */
//         return intersection(this, other)
//     }
//     distance(other) {
//         /** return the distance between self and other */
//         return distance(this, other)
//     }
//     parallel(other) {
//         /** return if self and other are parallel to each other */
//         // from ..calc.angle import parallel
//         // return parallel(this, other)
//     }

//     angle(other) {
//         /** return the angle between self and other */
//         // from ..calc.angle import angle
//         // return angle(this, other)
//     }

//     orthogonal(other) {
//         /** return if self and other are orthogonal to each other */
//         // from ..calc.angle import orthogonal
//         //return orthogonal(self, other)
//     }

// }

// export default interface GeoBody {
//   intersection(other: unknown): unknown
//   distance(other: unknown): unknown
//   parallel(other: unknown): unknown
//   orthogonal(other: unknown): unknown
// }

export interface Geometry<T> {
  equals(other: T): boolean
  getHashCode(): string
  contains<T extends Geometry<T>>(other: T): boolean
  translate(offset: Vector): T
  clone(): T
}

// class Point implements Geometry<Point> {
//   equals(other: Point): boolean {
//     return false
//   }
//   clone(): Point {
//     return this
//   }
//   translate(): Point {
//     return this
//   }
//   contains() {
//     return false
//   }
//   getHashCode() {
//     return 'point'
//   }
// }

// class Line implements Geometry<Line> {
//   equals<Line>(other: Line): boolean {
//     return false
//   }
//   clone(): Line {
//     return this
//   }
//   translate() {
//     return this
//   }
//   contains<T extends Geometry<T>>(other: T) {
//     return false
//   }
//   getHashCode() {
//     return 'line'
//   }
// }

// const p = new Point()
// const l = new Line()

// l.contains(p)
