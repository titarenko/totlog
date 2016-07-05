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
		request({
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
}
