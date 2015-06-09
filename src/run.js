/**
 * The main entry point of our code.
 */

var log = require('debug')('run');

try {
  log('Code is starting');
  require( 'main' );
}

catch ( err ) {
  log('There was an error OOPS', err);
}
