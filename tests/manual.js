require('../').init({ 
	level: 'error', 
	time: 'ddd DD MMM HH:mm:ss.sss', 
	file: { 
		layout: '{{time}} {{level}} {{text}}',
		level: 'debug', 
		filename: '/tmp/{{category}}.log',
		mkdirp: true
	}
});

var log = require('../')('integrations.abba');
log.info('started %s', { name: 'boo!', id: 1 });
try {
	log.debug('throwing error...', { some: 'info'});
	throw new Error('abba!');
} catch (error) {
	log.error('Task %s failed due to %s', 'taskName', error);	
}

var log2 = require('../')('ints/boneym');
log2.warn('bee!', 10, 12);
