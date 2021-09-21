import { Writable, WritableOptions } from 'stream'

import mklog, { LogLevel, Totlog } from '.'

class TotlogStream extends Writable {
	private level: LogLevel;
	private log: Totlog;

	constructor (options: WritableOptions & { level: LogLevel, category: string }) {
		super(options)
		const {
			level = 'debug',
			category = __filename,
		} = options || { }
		this.level = level
		this.log = mklog(category)
	}
	_write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
		try {
			this.log[this.level](typeof chunk === 'string'
				? chunk
				: chunk.toString(encoding)
			)
			callback()
		} catch (e) {
			callback(e instanceof Error ? e : new Error(String(e)))
		}
	}
}

module.exports = TotlogStream
