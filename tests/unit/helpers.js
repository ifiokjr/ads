/**
 * @module Helper functions used in the unit tests
 * 
 */

var _ = require('lodash'),
    veAdsObj = require('./ve-ads-object');


/**
 * Causes a test to fail intentionally.
 * Useful if setting up a tests but not yet sure how to implement them.
 */

var fail = function fail( ) {
  expect( 'test not yet implemented!!' ).to.be.false;
};


/**
 * Update the current URL
 */

var urlUpdate = function urlUpdate( str ) {
  if ( !str ) str = 'asdf';
  window.location = window.location.href + '#' + str;
};


/**
 * Generate the VeAds Object (can be overridden)
 */

generateVeAdsObject = function veAdsObject( obj ) {
  obj = obj || {};
  return _.chain( _.cloneDeep(validVeAds) ).extend( obj ).value( );
};


/**
 * Expose `helpers`
 */

module.exports = {
  fail: fail,
  urlUpdate: urlUpdate,
  obj: generateVeAdsObject
};