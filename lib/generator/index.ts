import type { Point } from "../types"

type Options = {
  width: number
  height: number
  minRadius: number
  maxRadius: number
  maxIterations: number
}

export class Generator {
  private worker: Worker | null = null
  private abortController: AbortController | null = null
  private eventCallbacks: Map<string, (data?: any) => void> = new Map()
  private options: Options

  private _data: Point[] = []
  get data() {
    return this._data.map<Point>((p) => ({ ...p }))
  }

  constructor(options: Options) {
    this.options = options
  }

  public start(): Generator {
    new Promise((resolve, reject) => {
      const controller = new AbortController()
      controller.signal.addEventListener(
        "abort",
        () => reject(controller.signal.reason),
        {
          once: true,
        },
      )
      this.abortController = controller

      this.worker = new Worker(new URL("./worker", import.meta.url), {
        type: "module",
      })
      this.worker.addEventListener("message", (e: MessageEvent) => {
        const message = e.data
        const callback = this.eventCallbacks.get(message.type)

        switch (message.type) {
          case "update":
            this._data = message.data
            callback?.()
            break

          case "finish":
            this._data = message.data
            resolve(message.data)
            callback?.(message.data)
            break
        }
      })
      this.worker.postMessage({ command: "start", args: [this.options] })
    })

    return this
  }

  public stop(): Generator {
    this.worker?.terminate()
    this.abortController?.abort()
    this.worker = null
    this.abortController = null

    return this
  }

  public on(
    event: "finish",
    callback: ((data: Point[]) => void) | null,
  ): Generator
  public on(event: "update", callback: (() => void) | null): Generator
  public on(event: string, callback: ((data?: any) => void) | null): Generator {
    if (callback) {
      this.eventCallbacks.set(event, callback)
    } else {
      this.eventCallbacks.delete(event)
    }

    return this
  }
}

export default function generator(options: Options) {
  return new Generator(options)
}
