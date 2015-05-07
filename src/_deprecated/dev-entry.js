var debug = require('debug'),
    log = debug('mode:debug');
debug.enable('*');

log('Launching application');
require('./main');