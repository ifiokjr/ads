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

generateVeAdsObject = function generateVeAdsObject( obj ) {
  obj = obj || {};
  return $.extend({}, veAdsObj, obj);
};


/**
 * set window veAdsObject
 */

setGlobalVeAdsObj = function setGlobalVeAdsObj( obj ) {
  ((window.veTagData = window.veTagData || {}).settings = {}).veAds = obj;
};

/**
 * unset window veAdsObject to an empty object
 */

unsetGlobalVeAdsObj = function unsetGlobalVeAdsObj( ) {
  window.veTagData = {};
};


/**
 * Expose `helpers`
 */

module.exports = {
  fail: fail,
  urlUpdate: urlUpdate,
  obj: generateVeAdsObject,
  setGlobalVeAdsObj: setGlobalVeAdsObj,
  unsetGlobalVeAdsObj: unsetGlobalVeAdsObj
};