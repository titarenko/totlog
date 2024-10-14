const mockRequire = require('mock-require')
const sinon = require('sinon')
require('should')

describe('stream', function () {
  let Stream, log, builder
  beforeEach(function () {
    log = { debug: sinon.spy() }
    builder = sinon.spy(() => log)
    mockRequire('..', builder)
    Stream = mockRequire.reRequire('../stream')
  })
  afterEach(function () {
    mockRequire.stopAll()
  })
  it('should use proper level and category', function () {
    const stream = new Stream({ level: 'debug', category: 'lol' })
    stream.write('blah')
    stream.end()
    builder.getCall(0).args[0].should.be.eql('lol')
    log.debug.getCall(0).args[0].should.be.eql('blah')
  })
})
