export type Vector2D = [number, number]

export type Vector3D = [number, number, number]

export type ColorCoords = [number, number, number]

export interface Point {
  id: number
  x: number
  y: number
  radius: number
  color?: string
}
