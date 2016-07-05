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
	build: build
};

function build (config) {
	var staticFilename = config.filename.match(_.templateSettings.interpolate) || config.filename.match(/\${\S+}/)
		? null 
		: config.filename;
	var dynamicFilename = _.template(config.filename);

	if (staticFilename && config.mkdirp) {
		mkdirpSync(path.dirname(staticFilename));
	}

	var write = staticFilename && writeStaticFilename || (config.mkdirp 
		? writeDynamicFilenameCreateDirectories 
		: writeDynamicFilenameNoDirectoryCreation
	);

	var last;

	return {
		write: function () {
			last = write.apply(this, arguments);
		},
		flush: function () {
			return last;
		}
	};

	function writeStaticFilename (message) {
		return fs.appendFileAsync(staticFilename, message.text + EOL);
	}

	function writeDynamicFilenameCreateDirectories (message) {
		var filename = dynamicFilename(message);
		var dirname = path.dirname(filename);
		return mkdirpAsync(dirname).then(function () {
			return fs.appendFileAsync(filename, message.text + EOL);
		});
	}

	function writeDynamicFilenameNoDirectoryCreation (message) {
		return fs.appendFileAsync(dynamicFilename(message), message.text + EOL);
	}
}
