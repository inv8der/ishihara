import {
  factory,
  create,
  all,
  type MathNumericType,
  type MathType,
  type Matrix,
  type MathJsStatic,
} from 'mathjs'

const createClip = factory(
  'clip',
  ['smaller', 'larger', 'map', 'isMatrix', 'isArray'],
  (math) => {
    function clip(x: number, min: MathNumericType, max: MathNumericType): number
    function clip(
      x: number[],
      min: MathNumericType,
      max: MathNumericType
    ): number[]
    function clip(
      x: number[][],
      min: MathNumericType,
      max: MathNumericType
    ): number[][]
    function clip(x: Matrix, min: MathNumericType, max: MathNumericType): Matrix
    function clip(
      x: MathType,
      min: MathNumericType,
      max: MathNumericType
    ): MathType {
      if (math.isArray(x) || math.isMatrix(x)) {
        return math.map(x, (v) =>
          math.smaller(v, min) ? min : math.larger(v, max) ? max : v
        )
      }
      return math.smaller(x, min) ? min : math.larger(x, max) ? max : x
    }

    return clip
  }
)

interface CustomMathJsStatic extends MathJsStatic {
  clip: ReturnType<typeof createClip>
}

const math = create(all, { epsilon: 1 / 10 ** 10 })
math.import(createClip)

export default math as CustomMathJsStatic
