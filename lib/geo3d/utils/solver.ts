import math from '../../math'

function shape(matrix: number[][]): [number, number] {
  if (!matrix) {
    return [0, 0]
  }
  // return math.size(matrix)
  return [matrix.length, matrix[0].length]
}

function isNull(value: number): boolean {
  // @todo configure epsilong
  return math.equal(value, 0) as boolean
}

function nullrow(row: number[]): boolean {
  return row.every((v) => isNull(v))
}

function findPivotRow(m: number[][]): number | null {
  const candidates = []
  for (let i = 0; i < m.length; i += 1) {
    const row = m[i]
    // Only rows where the pivot element is not zero can be used
    if (row[0] != 0) {
      candidates.push([Math.abs(row[0]), i])
    }
  }
  if (candidates.length === 0) {
    return null
  }
  // We use the one with the biggest absolute value
  let max = candidates[0]
  for (let i = 1; i < candidates.length; i += 1) {
    const [value] = candidates[i]
    max = value > max[0] ? candidates[i] : max
  }
  return max[1]
}

function gaussianElimination(m: number[][]): number[][] {
  /**
   * Return the row echelon form of m by applying the gaussian
   * elimination
   */
  // Shape of the matrix
  const [M, N] = shape(m)
  for (let j = 0; j < N - 1; j += 1) {
    // We ignore everything above the jth row and everything left of
    // the jth column (we assume they are 0 already)
    let pivot = findPivotRow(m.slice(j).map((row) => row.slice(j)))
    if (pivot == null) {
      continue
    }
    // find_pivot_row returns the index relative to j, so we need to
    // calculate the absolute index
    pivot += j
    // Swap the rows
    ;[m[j], m[pivot]] = [m[pivot], m[j]]

    // Note that the pivot row is now m[j]!
    // Eliminate everything else
    for (let i = j + 1; i < M; i += 1) {
      const factor = (m[i][j] / m[j][j]) * -1
      // Multiply the pivot row before adding them
      const multiplied_row = m[j].map((x) => factor * x)
      // Looks ugly, but we don't need numpy for it
      // Replace the ith row with the sum of the ith row and the
      // pivot row
      m[i] = m[i].map((x, i) => x + multiplied_row[i])
    }
  }
  // m shold now be in row echelon form
  return m
}

function first_nonzero(row: number[]): number {
  for (let i = 0; i < row.length; i += 1) {
    const v = row[i]
    if (!isNull(v)) {
      return i
    }
  }
  return row.length
}

class Solution {
  private _s: number[][]
  private varcount: number
  private _solvable: boolean
  private varargs: number
  private exact: boolean

  /** Holds a solution to a system of equations. */
  constructor(s: number[][]) {
    this._s = s
    this.varcount = shape(s)[1] - 1
    // No solution, 0a + 0b + 0c + ... = 1 which can never be true
    this._solvable = !s.some((row) => {
      return (
        row.slice(0, -1).every((coeff) => isNull(coeff)) &&
        !isNull(row[row.length - 1])
      )
    })

    // this._solvable = not any(
    //     all(null(coeff) for coeff in row[:-1]) and not null(row[-1])
    //     for row in s
    // )
    // unique_equations = sum(1 for row in s if not nullrow(row))

    const unique_equations = s.filter((row) => !nullrow(row)).length
    // for (const row of s) {
    //     if (!nullrow(row)) {
    //         unique_equations += 1
    //     }
    // }
    this.varargs = this.varcount - unique_equations
    this.exact = this.varargs == 0
  }

  isSolvable() {
    return this._solvable
  }

  // __nonzero__ = __bool__

  call(...args: number[]): number[] {
    if (!this._solvable) {
      throw new Error('Has no solution')
    }
    if (args.length != this.varargs) {
      throw new Error(`Expected ${this.varargs} values, got {v.length}`)
    }
    const v = [...args]
    const vals = new Array(this.varcount).fill(null)
    // Scan for real solutions
    for (const row of this._s) {
      // Can't use .count here because we need null()
      // I miss Haskell lambdas :(
      const count = row.slice(0, -1).filter((x) => !isNull(x)).length
      if (count == 1) {
        // We can find a variable here
        const index = row.slice(0, -1).findIndex((x) => !isNull(x))
        vals[index] = row[row.length - 1] / row[index]
      }
    }
    // Fill in the rest with given values
    for (let i = vals.length - 1; i >= 0; i -= 1) {
      if (v.length == 0) {
        break
      }
      if (vals[i] == null) {
        vals[i] = v.pop()
      }
    }

    for (let i = this._s.length - 1; i >= 0; i -= 1) {
      const row = this._s[i]
      if (nullrow(row)) {
        continue
      }
      const tbd = first_nonzero(row)
      let s = 0
      for (let j = tbd + 1; j < row.length - 1; j += 1) {
        s += -1 * row[j] * vals[j]
      }
      s += row[row.length - 1]
      vals[tbd] = s / row[tbd]
    }
    return vals
  }
}

export function solve(matrix: number[][]) {
  const ref = gaussianElimination(matrix)
  return new Solution(ref)
}
