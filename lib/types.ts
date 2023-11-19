export type Vector2D = [number, number]
export type Vector3D = [number, number, number]
export type ColorCoords = [number, number, number]

export type Shape = 'circle' | 'square' | 'triangle'
export type Deficiency = 'protan' | 'deutan' | 'tritan'

export interface Point {
  id: string
  x: number
  y: number
  radius: number
  color?: string
}
