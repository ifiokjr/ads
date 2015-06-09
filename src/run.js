/**
 * The main entry point of our code.
 */

var log = require('./common/debug')('ve:run');

try {
  log('Code is starting');
  var Main = require( './main' );
  var main = new Main( );
}

catch ( err ) {
  log('There was an error OOPS', err);
}
