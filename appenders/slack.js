var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var levels = require('../levels');

module.exports = {
	name: 'slack',
	build: build
};

function build (config) {
	var last;

	return {
		write: write,
		flush: flush
	};

	function write (message) {
		last = request({
			url: 'https://slack.com/api/chat.postMessage',
			method: 'POST',
			form: {
				token: config.token,
				channel: config.channel,
				icon_emoji: config.emoji,
				text: message.text
			}
		});
	}

	function flush () {
		return last;
	}
}
