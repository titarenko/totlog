# totlog

The only true log: zero dependencies, categories, colors, events for flexible support of additional appending logic. Bonus: slack and logstash appenders. Extra bonus: (almost) everything is tested.

[![Build Status](https://travis-ci.org/titarenko/totlog.svg?branch=master)](https://travis-ci.org/titarenko/totlog)
[![Coverage Status](https://coveralls.io/repos/github/titarenko/totlog/badge.svg?branch=master)](https://coveralls.io/github/titarenko/totlog?branch=master)

## How to use

`mymodule.js`
```js
const log = require('totlog')(__filename)
log.debug('anything that %s could pass to %s', 'you', 'util.format')
// will output colored content to console with
// - time
// - category = module filename relative to project root folder
// - level
// - formatted message
```

## Advanced

`log.js`
```js
const log = require('totlog')
module.exports = log
const slack = log.appenders.slack({ token: 'chpoken', channel: 'alerts', icon: ':hideyourpain:' })
log.on('message', message => {
	if (message.level == 'error') {
		slack(message)
	}
})
// notice how easy it is to define custom appending logic
// everything you need is JS knowledge
// without experiencing complex and/or obscure APIs
```

`mymodule.js`
```js
const log = require('./log')(__filename)
log.error('anything that %s could pass to %s', 'you', 'util.format')
// message will appear both in console and in slack
```

## License

MIT