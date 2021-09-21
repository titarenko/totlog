import util from 'util'
import path from 'path'
import events from 'events'

const colors = optionalRequire('colors/safe')
const emitter = new events.EventEmitter()

export default createLogger
export * as appenders from './appenders'
export const on = emitter.on.bind(emitter)

export type LogLevel = 'error' | 'warn' | 'debug'

export interface Totlog {
	error: LogFunction
	warn: LogFunction
	debug: LogFunction
}

export type LogFunction = (...args: any[]) => void

export interface LogEvent {
	time: string;
	level: LogLevel;
	category: string;
	message: string;
	content: string;
}

function createLogger (category: string, silent: boolean = false): Totlog {
	category = path.relative(path.join(__dirname, '../'), category)
	return {
		error: (...args: any[]) => log(silent, 'error', colors && colors.red, category, ...args),
		warn: (...args: any[]) => log(silent, 'warn', colors && colors.yellow, category, ...args),
		debug: (...args: any[]) => log(silent, 'debug', null, category, ...args),
	}
}

function log (silent: boolean, level: LogLevel, color: ((x: string) => string) | null, category: string, ...args: any[]) {
	const time = new Date()
	const message = util.format(...args)

	const content = `${time.toISOString()} ${level} ${category} ${message}`
	const coloredContent = colors
		? `${colors.white(time.toISOString())} ${color ? color(level) : level} ${colors.cyan(category)} ${message}`
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

function optionalRequire (name: string): any | null {
	try {
		return require(name)
	} catch (e) {
		return null
	}
}
