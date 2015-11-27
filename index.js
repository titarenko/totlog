var levels = require('./levels');
var config = require('./config');
var adapter = require('./adapter');
var builder = require('./builder');

builder.levels = levels;
builder.register = register;

module.exports = builder;

function register (appender) {
	config.registerAppenderDefaults(appender.name, appender.defaults);
	adapter.registerAppenderBuilder(appender.name, appender.build);
}

var consoleAppender = require('./appenders/console');
var fileAppender = require('./appenders/file');

builder.register(consoleAppender);
builder.register(fileAppender);
