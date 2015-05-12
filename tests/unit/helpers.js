/**
 * @module Helper functions used in the unit tests
 * 
 */

/**
 * Causes a test to fail intentionally.
 * Useful if setting up a tests but not yet sure how to implement them.
 */
var fail = function fail( ) {
  expect( 'test not yet implemented!!' ).to.be.false;
};


var urlUpdate = function urlUpdate( str ) {
  if ( !str ) str = 'asdf';
  window.location = window.location.href + '#' + str;
};



module.exports = {
  fail: fail,
  urlUpdate: urlUpdate
};