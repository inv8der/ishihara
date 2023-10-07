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
  private worker: Worker | null = null
  private abortController: AbortController | null = null
  private options: Options

  private _data: Point[] = []
  get data() {
    return this._data.map<Point>((p) => ({ ...p }))
  }

  constructor(options: Options) {
    super()
    this.options = options
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
      this.abortController = controller

      this.worker = new DotGeneratorWorker()
      this.worker.addEventListener('message', (e: MessageEvent) => {
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
      this.worker.postMessage({ command: 'start', args: [this.options] })
    })

    promise.catch(() => {
      // Silently ignore any errors since this function doesn't currently return a promise
    })
  }

  public stop() {
    this.worker?.terminate()
    this.abortController?.abort()
    this.worker = null
    this.abortController = null
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
