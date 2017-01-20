import { EventEmitter2 } from 'eventemitter2'

export interface Options {
  /**
   * After how much inactivity do we consider a user inactive? (in ms)
   */
  inactivityThreshold: number
}

const DEFAULT_OPTIONS: Options = {
  inactivityThreshold: 5 * 60 * 1000
}

interface State {
  hidden: boolean | undefined,
  timer: number | undefined
}

// TODO: Use ES6 Symbols (pending https://github.com/asyncly/EventEmitter2/issues/201)
export const ACTIVE = 'ACTIVE'
export const INACTIVE = 'INACTIVE'

export class ActivityMonitor extends EventEmitter2 {
  private _onVisibilityChange = this.onVisibilityChange.bind(this)

  private state: State = {
    hidden: undefined,
    timer: undefined
  }

  constructor(private document: Document, private options: Options = DEFAULT_OPTIONS) {
    super()

    if (!('hidden' in document)) {
      throw new Error('ActivityMonitor does not support this browser. List of suppprted browsers: http://caniuse.com/#feat=pagevisibility')
    }

    this.state.hidden = document.hidden

    document.addEventListener('visibilitychange', this._onVisibilityChange, false)
  }

  destroy() {
    this.document.removeEventListener('visibilitychange', this._onVisibilityChange)
  }

  private onVisibilityChange() {

    if (this.state.hidden === this.document.hidden) {
      return
    }

    // set an inactivity timer, announce inactivity after
    // the timer is elapsed (unless the timer gets cancelled)
    if (this.document.hidden) {
      this.state.hidden = true
      this.state.timer = setTimeout(() => {
        this.emit(INACTIVE)
        this.state.timer = undefined
      }, this.options.inactivityThreshold)
      return
    }

    // cancel inactivity timer
    if (this.state.timer) {
      clearTimeout(this.state.timer)
      this.state.timer = undefined
      return
    }

    // only emit active stage if it's a transition from
    // inactive -> active
    this.emit(ACTIVE)
    this.state.hidden = false
  }
}
