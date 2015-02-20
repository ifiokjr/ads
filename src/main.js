// Load Polyfills
var log = require('debug')('main');



require('./utils/polyfills');

var settings = require('./settings'),
    gdm = require('./gdmhandler'),
    run = require('./run');

log('VERSION: ' + settings.version.join('.')); // Version should be obvious from the logger
log('running gdm handler');
// Firstly lets run the gdm handler. 
gdm.start(settings.gdm);


log('running main code');
// Now we run the Genie specific tags. 
run.start(settings.genie);
