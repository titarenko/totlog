var _ = require('lodash');
var colors = require('colors/safe');
var PrettyError = require('pretty-error');
var levels = require('./levels');

module.exports = {
	buildMessageStringifier: buildMessageStringifier,
	buildArgStringifier: buildArgStringifier,
};

function buildMessageStringifier (config) {
	return _.isFunction(config.colors)
		? _.partial(stringifiers.message.singleColor, config.colors, config.layout)
		: _.partial(stringifiers.message.multiColor, config.colors, config.layout);
}

function buildArgStringifier (config) {
	return _.partial(
		stringify, 
		buildArgTypeStringifier('error', config),
		buildArgTypeStringifier('json', config)
	);
}

function buildArgTypeStringifier (type, config) {
	var prettyStringifier = stringifiers[type][config.prettify[type] ? 'pretty' : 'plain'];
	return prettyStringifier[config.colorize[type] ? 'colorized' : 'plain'];
}

function stringify (errorRenderer, jsonRenderer, instance) {
	if (_.isString(instance)) {
		return instance;
	}
	if (_.isError(instance) || instance instanceof Error) {
		return errorRenderer(instance);
	}
	if (_.isObject(instance)) {
		return jsonRenderer(instance);
	}
	return '' + instance;
}

var colorizedPrettyError = new PrettyError().skip(skipStackTraceLine);
var prettyError = new PrettyError().withoutColors().skip(skipStackTraceLine);

function skipStackTraceLine (line) {
	var original = line.original || line;
	return _.isEmpty(original) || original.indexOf('node_modules') !== -1 || original.indexOf('/') === -1;
}

var stringifiers = {
	message: {
		singleColor: renderSingleColorMessage,
		multiColor: renderMultiColorMessage
	},
	error: {
		pretty: {
			colorized: _.bind(colorizedPrettyError.render, colorizedPrettyError),
			plain: _.bind(prettyError.render, prettyError)
		},
		plain: {
			colorized: function (error) {
				return colors.red(error.stack);
			},
			plain: function (error) {
				return error.stack;
			}
		}
	},
	json: {
		pretty: {
			colorized: _.flow(_.partialRight(JSON.stringify, null, 4), colorizeJson),
			plain: _.partialRight(JSON.stringify, null, 4)
		},
		plain: {
			colorized: _.flow(JSON.stringify, colorizeJson),
			plain: JSON.stringify
		}
	}
};

function renderSingleColorMessage (colors, layout, message) {
	return colors(layout(message));
}

function renderMultiColorMessage (colors, layout, message) {
	colors = colors[levels[message.level]];
	return layout({
		time: colors.time(message.time),
		level: colors.level(message.level),
		category: colors.category(message.category),
		text: colors.text(message.text)
	});
}

function colorizeJson (json) {
	return json.replace(/"[^"]+?":/g, function (match) { 
		return colors.bold(match);
	});
}
