var _ = require('lodash');
var Promise = require('bluebird');
var minimatch = require('minimatch');

var levels = require('./levels');
var formatter = require('./formatter');

var appenderBuilders = {};

module.exports = {
	registerAppenderBuilder: registerAppenderBuilder,
	buildWriter: buildWriter
};

function registerAppenderBuilder (name, builder) {
	appenderBuilders[name] = builder;
}

function buildWriter (appenderConfigs) {
	var appenders = _.map(appenderConfigs, function (it) {
		var instance = appenderBuilders[it.name](it.config);
		return wrap(
			it.config.level, it.config.category, formatter.build(it.config), 
			instance
		);
	});

	return {
		write: write,
		flush: flush
	};

	function write (category, level) {
		var args = _.slice(arguments, 2);
		var message = {
			time: new Date(),
			level: level,
			category: category,
			args: args
		};
		_.invoke(appenders, 'write', message);
	}

	function flush () {
		return Promise.all(_.invoke(appenders, 'flush'));
	}
}

function wrap (minLevel, categoryPattern, formatter, appender) {
	var nativeWrite = _.isFunction(appender) ? appender : appender.write;
	var nativeFlush = _.isFunction(appender.flush) ? appender.flush : _.identity;
	
	return {
		write: write,
		flush: nativeFlush
	};

	function write (message) {
		if (levels[message.level] >= minLevel && minimatch(message.category, categoryPattern)) {
			nativeWrite(formatter(message));
		}
	}
}
