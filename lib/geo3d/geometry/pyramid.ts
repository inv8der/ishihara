import Polygon from './polygon'
import Point from './point'
import Vector, { dot } from '../utils/vector'
import GeoBody from './body'

export default class Pyramid implements GeoBody {
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
