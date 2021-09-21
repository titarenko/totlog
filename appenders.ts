import https from 'https'
import { IncomingMessage } from 'http'
import querystring from 'querystring'
import dgram from 'dgram'
import net from 'net'

import mklog, { LogEvent } from '.'

const log = mklog(__filename, true)

export interface SlackOptions {
	token: string
	channel: string
	icon: string
}

export interface LogstashOptions {
	url: string
}

export function slack ({ token, channel, icon }: SlackOptions) {
	if (!token) {
		throw new Error('Token is required.')
	}

	if (!channel) {
		throw new Error('Channel is required.')
	}

	return function (ev: LogEvent) {
		const payload = querystring.stringify({
			token: token,
			channel: channel,
			icon_emoji: icon,
			mrkdwn: true,
			text: `*${ev.time}* ${'`'}${ev.category}${'`'} ${'```\n'}${ev.message}${'\n```'}`,
		})

		const request = https.request({
			hostname: 'slack.com',
			path: '/api/chat.postMessage',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(payload),
			},
		}, handleResponse)

		request.on('error', handlError)
		request.write(payload)
		request.end()

		function handleResponse (response: IncomingMessage) {
			if (response.statusCode != 200) {
				handlError(new Error(String(response.statusCode)))
			}
			response.on('error', handlError)
		}

		function handlError (error: Error) {
			log.error(`failed to send message to slack due to ${error.stack}`)
		}
	}
}

export function logstash ({ url }: LogstashOptions) {
	if (!url) {
		throw new Error('URL is required.')
	}

	const protocol = url.slice(0, 6)

	if (protocol != 'udp://' && protocol != 'tcp://') {
		throw new Error('Only TCP and UDP protocols are supported.')
	}

	url = url.slice(6)

	const [host, rawPort] = url.split(':')
	const port = parseInt(rawPort, 10)

	if (!port) {
		throw new Error('Port is required.')
	}

	let udpSocket: dgram.Socket | null
	function udp (ev: LogEvent) {
		if (!udpSocket) {
			udpSocket = dgram.createSocket('udp4')
			udpSocket.on('error', (error: Error) => {
				log.error(`udp socket error ${error.stack}`)
				if (udpSocket) {
					udpSocket.close()
					udpSocket = null
				}
			})
		}

		const buffer = Buffer.from(JSON.stringify(ev), 'utf-8')
		udpSocket.send(buffer, 0, buffer.length, port, host, (error: Error | null) => {
			if (!error) {
				return
			}
			log.error(`failed to send message to logstash due to ${error.stack}`)
		})
	}

	let tcpSocket: net.Socket | null
	function tcp (ev: LogEvent) {
		if (!tcpSocket) {
			tcpSocket = net.createConnection({ host, port: port })
			tcpSocket.on('error', (error: Error) => {
				log.error(`tcp socket error ${error.stack}`)
				if (tcpSocket) {
					tcpSocket.destroy()
					tcpSocket = null
				}
			})
		}

		const buffer = Buffer.from(JSON.stringify(ev), 'utf-8')
		tcpSocket.write(buffer, (error: Error | undefined) => {
			if (!error) {
				return
			}
			log.error(`failed to send message to logstash due to ${error.stack}`)
		})
	}

	function shutdownTcp () {
		if (tcpSocket) {
			tcpSocket.destroy()
		}
	}

	process.on('SIGINT', shutdownTcp)
	process.on('SIGTERM', shutdownTcp)

	return protocol === 'tcp://' ? tcp : udp
}
