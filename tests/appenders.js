const mockRequire = require('mock-require')
const sinon = require('sinon')
const should_ = require('should')
const shouldSinon_ = require('should-sinon')

describe('loggers', function () {
	describe('slack', function () {
		let request, requestApi, slack
		beforeEach(function () {
			requestApi = { on: sinon.spy(), write: sinon.spy(), end: sinon.spy() }
			request = sinon.spy(() => requestApi)
			mockRequire('https', { request })
			slack = mockRequire.reRequire('../appenders').slack
		})
		afterEach(function () {
			mockRequire.stopAll()
		})
		it('should send messages', function () {
			const instance = slack({ token: 'chpoken', channel: 'ololo' })
			instance({ time: '1', level: 'error', category: '2', message: '3' })
			request.should.be.calledWith({
				hostname: 'slack.com',
				path: '/api/chat.postMessage',
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': 98,
				},
			})
			requestApi.on.should.be.calledWith('error')
			const expectedPayload = 'token=chpoken&channel=ololo&icon_emoji=&mrkdwn=true&text='
				+ encodeURIComponent('*1* `2` ```\n3\n```')
			requestApi.write.should.be.calledWith(expectedPayload)
			requestApi.end.should.be.called()
		})
	})
	describe('logstash', function () {
		let socket, logstash
		beforeEach(function () {
			socket = {
				on: sinon.spy(),
				send: sinon.spy(),
				write: sinon.spy(),
			}
			mockRequire('dgram', { createSocket: () => socket })
			mockRequire('net', { createConnection: () => socket })
			logstash = mockRequire.reRequire('../appenders').logstash
		})
		afterEach(function () {
			mockRequire.stopAll()
		})
		it('should send messages thru udp', function () {
			const instance = logstash({ url: 'udp://localhost:3000' })
			const message = { time: '2', level: 'debug', category: '3', message: '4' }
			instance(message)
			const buffer = new Buffer(JSON.stringify(message))
			socket.send.should.be.calledWith(buffer, 0, buffer.length, '3000', 'localhost')
		})
		it('should send messages thru tcp', function () {
			const instance = logstash({ url: 'tcp://localhost:3000' })
			const message = { time: '2', level: 'debug', category: '3', message: '4' }
			instance(message)
			const buffer = new Buffer(JSON.stringify(message))
			socket.write.should.be.calledWith(buffer)
		})
	})
})