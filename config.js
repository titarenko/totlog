var _ = require('lodash');
var fs = require('fs');
var colors = require('colors/safe');
var levels = require('./levels');

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g; // {{ expression }} placeholder format

module.exports = {
	registerAppenderDefaults: registerAppenderDefaults,
	getConfig: getConfig
};

var appenderDefaults = {};

var preferenceKeys = ['level', 'category', 'fatal', 'time', 'layout', 'colors', 'colorize', 'prettify'];

var defaultConfig = {
	time: 'YYYY-MM-DD HH:mm:ss.sss',
	layout: '{{time}} {{level}} {{category}} {{text}}',
	level: 'debug',
	category: '*',
	fatal: {
		text: 'FATAL',
		exitCode: -1
	},
	colorize: {
		json: true,
		error: true
	},
	prettify: {
		json: false,
		error: true
	},
	colors: {
		debug: {
			time: 'grey',
			level: ['grey', 'inverse'],
			category: ['grey', 'underline'],
			text: 'grey'
		},
		info: {
			time: 'white',
			level: ['white', 'inverse'],
			category: ['white', 'underline'],
			text: 'white'
		},
		warn: {
			time: 'yellow',
			level: ['yellow', 'inverse'],
			category: ['yellow', 'underline'],
			text: 'yellow'
		},
		error: {
			time: 'red',
			level: ['red', 'inverse'],
			category: ['red', 'underline'],
			text: 'red'
		}
	},
	console: true
};

function registerAppenderDefaults (name, config) {
	appenderDefaults[name] = config;
}

function getConfig (options) {
	if (_.isString(options)) {
		return getConfig(readConfig(options));
	}

	var config = getFullConfig(defaultConfig, options);

	return {
		logger: _.pick(config, preferenceKeys),
		appenders: getAppenderConfigs(config)
	};
}

function getAppenderConfigs (options) {
	var baseConfig = _.pick(options, preferenceKeys);

	var appenders = _(options).omit(preferenceKeys).map(function (configs, name) {
		configs = _.isArray(configs) ? configs : [configs];
		return configs.map(function (config) {
			return {
				name: name,
				config: getFullConfig(baseConfig, appenderDefaults[name], config === true ? {} : config)
			};
		});
	}).flatten().map(normalizeItem).value();

	return appenders;
}

function readConfig (filename) {
	return JSON.parse(fs.readFileSync(filename));
}

function getFullConfig (base) {
	var configs = _.slice(arguments, 1);
	configs.unshift(_.cloneDeep(base));
	return _.merge.apply(_, configs);
}

function normalizeItem (it) {
	var config = it.config;

	if (!_.isUndefined(config.layout)) { 
		config.layout = _.template(config.layout);
	}
	if (!_.isUndefined(config.level)) { 
		config.level = levels[config.level];
	}
	if (!_.isUndefined(config.colors)) {
		if (_.isObject(config.colors)) {
			config.colors = _(config.colors).keys().sortBy(function (level) {
				return levels[level];
			}).map(function (level) {
				_.each(config.colors[level], function (spec, field) {
					config.colors[level][field] = getColor(spec);
				});
				return config.colors[level];
			}).value();
		} else {
			config.colors = getColor(config.colors);
		}
	}

	return it;
}

function getColor (spec) {
	if (_.isArray(spec)) {
		return spec.reduce(function (memo, color) { 
			return memo[color]; 
		}, colors);
	} else {
		return colors[spec];
	}
}
