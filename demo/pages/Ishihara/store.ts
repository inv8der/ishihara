import { create } from 'zustand'
import type { IshiharaPlate } from '../../../dist/ishihara'

type Shape = Parameters<IshiharaPlate['addShape']>[0]
type Deficiency = Parameters<IshiharaPlate['setColors']>[0]

interface State {
  seed: number
  shape: Shape
  colorScheme: Deficiency
  contrast: number
  colorBlindMode: false | Deficiency
  severity: number
}

interface Action {
  setShape: (shape: Shape) => void
  setColorScheme: (colors: Deficiency, contrast?: number) => void
  simulateColorBlindness: (mode: false | Deficiency, severity?: number) => void
  generatePlate: () => void
}

export const useIshiharaStore = create<State & Action>((set) => ({
  seed: 1,
  shape: 'circle',
  colorScheme: 'protan',
  contrast: 1,
  colorBlindMode: false,
  severity: 1,

  setShape(shape) {
    set(() => ({ shape }))
  },
  setColorScheme(colorScheme, contrast = 1) {
    set(() => ({ colorScheme, contrast }))
  },
  simulateColorBlindness(mode, severity) {
    set((state) => ({
      colorBlindMode: mode,
      severity: severity ?? state.severity,
    }))
  },
  generatePlate() {
    set((state) => ({
      seed: state.seed + 1,
    }))
  },
}))
