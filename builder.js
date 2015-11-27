var _ = require('lodash');

var handler = require('./handler');

module.exports = buildCategoryLogger;

buildCategoryLogger.init = init;

function init (options) {
	handler.configure(options);
	if (_.isString(options)) {
		process.on('SIGUSR2', _.partial(handler.configure, options));
	}
}

function buildCategoryLogger (category) {
	var writeCategory = _.partial(handler.handleNormal, category);

	var writeDebug = _.partial(writeCategory, 'debug');

	writeDebug.debug = writeDebug;
	writeDebug.info = _.partial(writeCategory, 'info');
	writeDebug.warn = _.partial(writeCategory, 'warn');
	writeDebug.error = _.partial(writeCategory, 'error');
	writeDebug.fatal = _.partial(handler.handleFatal, category);

	return writeDebug;
}
