var Promise = require('bluebird');
var _ = require('lodash');

var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var mkdirpSync = _.memoize(require('mkdirp').sync);

var EOL = require('os').EOL;

module.exports = {
	name: 'file',
	build: build
};

function build (config) {
	var staticFilename = _.templateSettings.interpolate.test(config.filename) ? null : config.filename;
	var dynamicFilename = _.template(config.filename);

	if (staticFilename && config.mkdirp) {
		mkdirpSync(path.dirname(staticFilename));
	}

	var write = staticFilename && writeStaticFilename || (config.mkdirp 
		? writeDynamicFilenameCreateDirectories 
		: writeDynamicFilenameNoDirectoryCreation
	);

	return write;

	function writeStaticFilename (message) {
		return fs.appendFileAsync(staticFilename, message.text + EOL);
	}

	function writeDynamicFilenameCreateDirectories (message) {
		var filename = dynamicFilename(message);
		var dirname = path.dirname(filename);
		return mkdirp(dirname).then(function () {
			fs.appendFileAsync(filename, message.text + EOL);
		});
	}

	function writeDynamicFilenameNoDirectoryCreation (message) {
		return fs.appendFileAsync(dynamicFilename(message), message.text + EOL);
	}
}
