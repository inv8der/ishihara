import DotGeneratorWorker from './worker?worker&inline'
import type { Point } from '../types'

type GeneratorOptions = {
  width: number
  height: number
  minRadius: number
  maxRadius: number
  maxIterations: number
}

export default class DotGenerator extends EventTarget {
  private _worker: Worker | null = null
  private _options: GeneratorOptions
  private _data: Point[] = []

  get data() {
    return this._data.map<Point>((p) => ({ ...p }))
  }

  constructor(options: GeneratorOptions) {
    super()
    this._options = options
  }

  public start() {
    this._worker = new DotGeneratorWorker()
    this._worker.addEventListener('message', (e: MessageEvent) => {
      const message = e.data
      switch (message.type) {
        case 'update':
        case 'finish':
          this._data = message.data
          break
      }
      this.dispatchEvent(new Event(message.type))
    })
    this._worker.postMessage({ command: 'start', args: [this._options] })
  }

  public stop() {
    this._worker?.terminate()
    this._worker = null
  }

  public addEventListener(
    type: 'update' | 'finish',
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions | undefined
  ): void {
    super.addEventListener(type, callback, options)
  }

  public removeEventListener(
    type: 'update' | 'finish',
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions | undefined
  ): void {
    super.removeEventListener(type, callback, options)
  }
}
