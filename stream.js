const { Writable } = require('stream')
const totlog = require('.')

class TotlogStream extends Writable {
  constructor (options) {
    super(options)
    const {
      level = 'debug',
      category = __filename,
    } = options || { }
    this.level = level
    this.log = totlog(category)
  }

  _write (chunk, encoding, done) {
    if (typeof chunk !== 'string' && encoding === 'buffer') {
      chunk = chunk.toString(this._writableState.defaultEncoding)
    }
    this.log[this.level](typeof chunk === 'string'
      ? chunk
      : chunk.toString(encoding),
    )
    done()
  }
}

module.exports = TotlogStream
