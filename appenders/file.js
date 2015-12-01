var Promise = require('bluebird');
var _ = require('lodash');

var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var mkdirp = require('mkdirp');
var mkdirpSync = _.memoize(mkdirp.sync);
var mkdirpAsync = _.memoize(Promise.promisify(mkdirp));

var EOL = require('os').EOL;

module.exports = {
	name: 'file',
	defaults: {
		encoding: 'ansi',
	},
	build: build
};

function build (config) {
	var staticFilename = config.filename.match(_.templateSettings.interpolate) ? null : config.filename;
	var dynamicFilename = _.template(config.filename);

	if (staticFilename && config.mkdirp) {
		mkdirpSync(path.dirname(staticFilename));
	}

	var write = staticFilename && _.partial(append, staticFilename) || (config.mkdirp 
		? writeDynamicFilenameCreateDirectories 
		: writeDynamicFilenameNoDirectoryCreation
	);

	return write;

	function writeDynamicFilenameCreateDirectories (message) {
		var filename = dynamicFilename(message);
		var dirname = path.dirname(filename);
		return mkdirpAsync(dirname).then(function () {
			return append(filename, message);
		});
	}

	function writeDynamicFilenameNoDirectoryCreation (message) {
		return append(dynamicFilename(message), message);
	}

	function append (filename, message) {
		return fs.appendFileAsync(filename, message.text + EOL, config.encoding);
	}
}
