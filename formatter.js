var _ = require('lodash');
var util = require('util');
var moment = require('moment');
var levels = require('./levels');
var stringifier = require('./stringifier');

module.exports = {
	build: build
};

function build (config) {
	return _.partial(
		format, 
		_.partial(renderTime, config.time),
		stringifier.buildMessageStringifier(config), 
		stringifier.buildArgStringifier(config)
	);
}

function format (timeRenderer, messageRenderer, argsStringifier, message) {
	return {
		category: message.category,
		level: levels[message.level],
		text: messageRenderer({
			time: timeRenderer(message.time),
			level: message.level,
			category: message.category,
			text: util.format.apply(util, message.args.map(argsStringifier))
		})
	};
}

function renderTime (format, time) {
	return moment(time).format(format);
}
