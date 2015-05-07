var log = require('debug')('mode:production');
log('launching application');
try{
  require('./main');
}
catch (e) {
  log('Error', e);
}
