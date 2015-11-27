var levels = require('../levels');

module.exports = {
	name: 'console',
	build: build
};

function build (config) {
	return write;

	function write (message) {
		var method = message.level >= levels.error ? console.error : console.log;
		method(message.text);
	}
}
