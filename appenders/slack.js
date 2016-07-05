var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var levels = require('../levels');

module.exports = {
	name: 'slack',
	build: build
};

function build (config) {
	return write;

	function write (message) {
		if (message.level < levels.error) {
			return;
		}

		request({
			url: 'https://slack.com/api/chat.postMessage',
			method: 'POST',
			body: {
				token: config.token,
				channel: config.channel,
				icon_emoji: config.emoji,
				text: message.text
			}
		});
	}
}
