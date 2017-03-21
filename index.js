const util = require('util')
const path = require('path')
const events = require('events')
const colors = optionalRequire('colors/safe')

const emitter = new events.EventEmitter()

module.exports = createLogger
module.exports.appenders = require('./appenders')
module.exports.on = (...args) => emitter.on(...args)

function createLogger (category, silent) {
	category = path.relative(path.join(__dirname, '../'), category)
	return {
		error: (...args) => log(silent, 'error', colors && colors.red, category, ...args),
		warn: (...args) => log(silent, 'warn', colors && colors.yellow, category, ...args),
		debug: (...args) => log(silent, 'debug', null, category, ...args),
	}
}

function log (silent, level, color, category, ...args) {
	const time = new Date()
	const message = util.format(...args)

	const content = `${time.toString()} ${level} ${category} ${message}`
	const coloredContent = colors
		? `${colors.white(time.toString())} ${color ? color(level) : level} ${colors.cyan(category)} ${message}`
		: null

	if (level == 'error') {
		console.error(coloredContent || content) // eslint-disable-line no-console
	} else {
		console.log(coloredContent || content) // eslint-disable-line no-console
	}

	if (!silent) {
		emitter.emit('message', {
			time,
			level,
			category,
			message,
			content,
		})
	}
}

function optionalRequire (name) {
	try {
		return require(name)
	} catch (e) {
		return null
	}
}