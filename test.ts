import { ActivityMonitor, ACTIVE, INACTIVE } from './'

jest.useFakeTimers()

it('should not notify of inactivity immediately when the user becomes inactive', () => {
  const { document, active, inactive } = create(false)
  document.hidden = true
  document.dispatchEvent(new Event('visibilitychange'))
  expect(active).not.toBeCalled()
  expect(inactive).not.toBeCalled()
})

it('should notify of inactivity after the INACTIVITY_THRESHOLD when the user becomes inactive', () => {
  const { document, active, inactive } = create(false)
  document.hidden = true
  document.dispatchEvent(new Event('visibilitychange'))
  jest.runAllTimers()
  expect(active).not.toBeCalled()
  expect(inactive).toBeCalled()
})

it('should not notify of inactivity if the user becomes inactive, then becomes active again before the INACTIVITY_THRESHOLD has elapsed', () => {
  const { document, active, inactive } = create(false)

  document.hidden = true
  document.dispatchEvent(new Event('visibilitychange'))

  document.hidden = false
  document.dispatchEvent(new Event('visibilitychange'))

  jest.runAllTimers()
  expect(active).not.toBeCalled()
  expect(inactive).not.toBeCalled()
})

it('should notify of activity immediately when the user becomes active', () => {
  const { document, active, inactive } = create(true)
  document.hidden = false
  document.dispatchEvent(new Event('visibilitychange'))
  expect(active).toBeCalled()
  expect(inactive).not.toBeCalled()
})

it('should notify of activity and inactivity if the user becomes active, then becomes inactive again before the INACTIVITY_THRESHOLD has elapsed', () => {
  const { document, active, inactive } = create(true)

  document.hidden = false
  document.dispatchEvent(new Event('visibilitychange'))

  document.hidden = true
  document.dispatchEvent(new Event('visibilitychange'))

  jest.runAllTimers()
  expect(active).toBeCalled()
  expect(inactive).toBeCalled()
})

it('should notify of activity only if the previous notification was for inactivity', () => {
  const { document, active, inactive } = create(false)

  document.hidden = false
  document.dispatchEvent(new Event('visibilitychange'))
  document.dispatchEvent(new Event('visibilitychange'))
  document.dispatchEvent(new Event('visibilitychange'))

  jest.runAllTimers()
  expect(active).not.toBeCalled()
  expect(inactive).not.toBeCalled()
})

it('should notify of inactivity only if the previous notification was for activity', () => {
  const { document, active, inactive } = create(true)

  document.hidden = true
  document.dispatchEvent(new Event('visibilitychange'))
  document.dispatchEvent(new Event('visibilitychange'))
  document.dispatchEvent(new Event('visibilitychange'))

  jest.runAllTimers()
  expect(active).not.toBeCalled()
  expect(inactive).not.toBeCalled()
})

it('should throw an Error if the browser does not support the Page Visibility API', () => {
  expect(() => create(false, {})).toThrowError(/support/)
})

it('should clean up after itself when the #destroy method is called', () => {
  const { document, monitor } = create(true)
  document.removeEventListener = jest.fn()
  monitor.destroy()
  expect(document.removeEventListener).toBeCalled()
})

function create(initiallyHidden: boolean, customDocument?: any) {

  const document: any = {
    _listener: null,
    addEventListener(_type: string, fn: () => {}) { this._listener = fn },
    dispatchEvent() { this._listener && this._listener() },
    removeEventListener() { this._listener = null },
    hidden: initiallyHidden
  }

  const active = jest.fn()
  const inactive = jest.fn()

  const monitor = new ActivityMonitor(customDocument || document)
  monitor.on(ACTIVE, active)
  monitor.on(INACTIVE, inactive)

  return {
    document: customDocument || document,
    active,
    inactive,
    monitor
  }
}
