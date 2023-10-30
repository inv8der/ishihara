// function distance(a, b) {
//   /**
//    * **Input:**
//    * - a: Point/Line/Line/Plane/Plane
//    * - b: Point/Point/Line/Point/Line
//    *
//    * **Output:**
//    * Returns the distance between two objects. This includes
//    * - Point/Point
//    * - Line/Point
//    * - Line/Line
//    * - Plane/Point
//    * - Plane/Line
//    */
//   if (a instanceof Point && b instanceof Point) {
//     // The distance between two Points A and B is just the length of
//     // the vector AB
//     return Vector(a, b).length()
//   } else if (a instanceof Point && b instanceof Line) {
//     // To get the distance between a point and a line, we place an
//     // auxiliary plane P. P is orthogonal to the line and contains
//     // the point. To achieve this, we just use the direction vector
//     // of the line as the normal vector of the plane.
//     const aux_plane = Plane(a, b.dv)
//     // We then calculate the intersection of the auxiliary plane and
//     // the line
//     const foot = intersection(aux_plane, b)
//     // And finally the distance between the point and the
//     // intersection point, which can be reduced to a Point-Point
//     // distance
//     return distance(a, foot)
//   } else if (a instanceof Line && b instanceof Point) {
//     return distance(b, a)
//   } else if (a instanceof Line && b instanceof Line) {
//     // To get the distance between two lines, we just use the formula
//     //        _   _    _
//     // d = | (q - p) * n |
//     // where n is a vector orthogonal to both lines and with length 1!
//     // We can achieve this by using the normalized cross product
//     const normale = a.dv.cross(b.dv).normalized()
//     return Math.abs((b.sv - a.sv) * normale)
//   } else if (a instanceof Point && b instanceof Plane) {
//     // To get the distance between a point and a plane, we just take
//     // a line that's orthogonal to the plane and goes through the
//     // point
//     const aux_line = Line(a, b.n)
//     // We then get the intersection point...
//     const foot = intersection(aux_line, b)
//     // ...and finally the distance
//     return distance(a, foot)
//   } else if (a instanceof Plane && b instanceof Point) {
//     return distance(b, a)
//   } else if (a instanceof Line && b instanceof Plane) {
//     if (parallel(a, b)) {
//       // If the line is parallel, every point has the same distance
//       // to the plane, so we just pick one point and calculate its
//       // distance
//       return distance(Point(a.sv), b)
//     }
//     // If they are not parallel, they will eventually intersect, so
//     // the distance is 0
//     return 0.0
//   } else if (a instanceof Plane && b instanceof Line) {
//     return distance(b, a)
//   } else {
//     throw new Error(
//       'Not implemented distance between {} and {}'.format(type(a), type(b))
//     )
//   }
// }
