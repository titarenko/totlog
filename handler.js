var _ = require('lodash');

var config = require('./config');
var adapter = require('./adapter');

var loggerConfig, writer;

module.exports = {
	configure: configure,
	handleNormal: handleNormal,
	handleFatal: handleFatal
};

function configure (options) {
	var completeConfig = config.getConfig(options);
	loggerConfig = completeConfig.logger;
	writer = adapter.buildWriter(completeConfig.appenders);
}

function handleNormal () {
	writer.write.apply(writer, arguments);
}

function handleFatal (category) {
	var fixedArgs = loggerConfig.fatal
		? [category, 'error', loggerConfig.fatal.text]
		: [category, 'error'];
	var otherArgs = _.slice(arguments, 1);
	var args = fixedArgs.concat(otherArgs);

	handleNormal.apply(this, args);

	var exitCode = _.get(loggerConfig, 'fatal.exitCode');
	if (_.isNumber(exitCode)) {
		writer.flush().then(function () {
			process.exit(exitCode);
		});
	}
}
