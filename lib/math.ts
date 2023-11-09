/* eslint-disable @typescript-eslint/ban-ts-comment */
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

const createAbsEqual = factory(
  'absEqual',
  // @ts-ignore - MathJsInstance is missing type info for numeric()
  ['equal', 'add', 'numeric'],
  // @ts-ignore - MathJsInstance is missing type info for numeric()
  ({ equal, add, numeric }) => {
    const absEqual: typeof equal = (...args) => {
      const x = typeof args[0] === 'string' ? numeric(args[0]) : args[0]
      const y = typeof args[1] === 'string' ? numeric(args[1]) : args[1]
      return equal(x, y) || equal(add(x, 1), add(y, 1))
    }

    return absEqual
  }
)

const createAbsSmaller = factory(
  'absSmaller',
  // @ts-ignore - MathJsInstance is missing type info for numeric()
  ['smaller', 'add', 'numeric'],
  // @ts-ignore - MathJsInstance is missing type info for numeric()
  ({ smaller, add, numeric }) => {
    const absSmaller: typeof smaller = (...args) => {
      const x = typeof args[0] === 'string' ? numeric(args[0]) : args[0]
      const y = typeof args[1] === 'string' ? numeric(args[1]) : args[1]
      return smaller(x, y) || smaller(add(x, 1), add(y, 1))
    }

    return absSmaller
  }
)

const createAbsLarger = factory(
  'absLarger',
  // @ts-ignore - MathJsInstance is missing type info for numeric()
  ['larger', 'add', 'numeric'],
  // @ts-ignore - MathJsInstance is missing type info for numeric()
  ({ larger, add, numeric }) => {
    const absLarger: typeof larger = (...args) => {
      const x = typeof args[0] === 'string' ? numeric(args[0]) : args[0]
      const y = typeof args[1] === 'string' ? numeric(args[1]) : args[1]
      return larger(x, y) || larger(add(x, 1), add(y, 1))
    }

    return absLarger
  }
)

interface CustomMathJsInstance extends MathJsInstance {
  clip: ReturnType<typeof createClip>
  absEqual: MathJsInstance['equal']
  absSmaller: MathJsInstance['smaller']
  absLarger: MathJsInstance['larger']
}

const math = create(all, config)
math.import([createClip, createAbsEqual, createAbsSmaller, createAbsLarger])

export default math as CustomMathJsInstance
