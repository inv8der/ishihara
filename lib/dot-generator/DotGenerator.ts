import DotGeneratorWorker from './worker?worker&inline'
import type { Point } from '../types'

type Options = {
  width: number
  height: number
  minRadius: number
  maxRadius: number
  maxIterations: number
}

export default class DotGenerator extends EventTarget {
  private _worker: Worker | null = null
  private _abortController: AbortController | null = null
  private _options: Options
  private _data: Point[] = []

  get data() {
    return this._data.map<Point>((p) => ({ ...p }))
  }

  constructor(options: Options) {
    super()
    this._options = options
  }

  public start() {
    const promise = new Promise((resolve, reject) => {
      const controller = new AbortController()
      controller.signal.addEventListener(
        'abort',
        () => reject(controller.signal.reason),
        {
          once: true,
        }
      )
      this._abortController = controller

      this._worker = new DotGeneratorWorker()
      this._worker.addEventListener('message', (e: MessageEvent) => {
        const message = e.data

        switch (message.type) {
          case 'update':
            this._data = message.data
            break

          case 'finish':
            this._data = message.data
            resolve(message.data)
            break
        }

        this.dispatchEvent(new Event(message.type))
      })
      this._worker.postMessage({ command: 'start', args: [this._options] })
    })

    promise.catch(() => {
      // Silently ignore any errors since this function doesn't currently return a promise
    })
  }

  public stop() {
    this._worker?.terminate()
    this._abortController?.abort()
    this._worker = null
    this._abortController = null
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
