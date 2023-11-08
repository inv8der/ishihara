import {
  factory,
  create,
  all,
  type MathNumericType,
  type MathType,
  type Matrix,
  type MathJsInstance,
} from 'mathjs'

const config = {
  epsilon: 1e-10,
}

const createClip = factory(
  'clip',
  ['smaller', 'larger', 'map', 'isMatrix', 'isArray'],
  ({ smaller, larger, map, isMatrix, isArray }) => {
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
      if (isArray(x) || isMatrix(x)) {
        return map(x, (v) => (smaller(v, min) ? min : larger(v, max) ? max : v))
      }
      return smaller(x, min) ? min : larger(x, max) ? max : x
    }

    return clip
  }
)

// const _math = create(all, config)
// const createEqualScalar = factory('equalScalar', [], () => {
//   function equalScalar(x: MathScalarType, y: MathScalarType): boolean {
//     x = _math.add(x, 1)
//     y = _math.add(y, 1)

//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     return _math.equalScalar(x, y)
//   }

//   return equalScalar
// })

interface CustomMathJsInstance extends MathJsInstance {
  clip: ReturnType<typeof createClip>
}

// const {
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   createEqualScalar: _createEqualScalar,
//   ...allExceptEqualScalar
// } = all

const math = create(all, config)
math.import([createClip])

export default math as CustomMathJsInstance
