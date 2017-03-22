# browser-activity-monitor [![Build Status](https://img.shields.io/circleci/project/bcherny/browser-activity-monitor.svg?branch=master&style=flat-square)](https://circleci.com/gh/bcherny/browser-activity-monitor) [![NPM](https://img.shields.io/npm/v/browser-activity-monitor.svg?style=flat-square)](https://www.npmjs.com/package/browser-activity-monitor) [![MIT](https://img.shields.io/npm/l/browser-activity-monitor.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> A simple activity monitor to alert you when the user becomes active or inactive

## Installation

```sh
npm install browser-activity-monitor --save
```

## Usage

```js
import { ActivityMonitor, ACTIVE, INACTIVE } from 'browser-activity-monitor'

const monitor = new ActivityMonitor(document)
monitor.on(ACTIVE, () => console.log('User is active!'))
monitor.on(INACTIVE, () => console.log('User is inactive!'))

// ...
monitor.destroy()
```

## Tests

```sh
npm test
```

## License

Apache-2.0
