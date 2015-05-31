/**
 * @module Helper functions used in the unit tests
 *
 */

var _ = require( 'lodash' ),
    veAdsObj = require( './ve-ads-object' ),
    fixtures = require( '../fixtures' );


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

var generateVeAdsObject = function generateVeAdsObject( obj ) {
  obj = obj || {};
  return _.extend( _.clone(veAdsObj, true), obj );
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
 * Add one of the fixtures to the DOM - used in a beforeEach handler
 * Paired with clearDOM function

 * @param {String} fixture - property taken from the fixtures obj
 *
 * @returns {jQueryElement} - the created element;
 */

var addToDOM = function( fixture ) {
  var $el = $( '<div id="fixtures">' );
  $el.css( { display: 'none', visibility: 'hidden' } );
  $( 'body' ).append( $el );

  $el.html( fixtures[fixture] );
  return $el;
};



var clearDOM = function( ) {
  $( '#fixtures' ).remove( );
};


/**
 * Expose `helpers`
 */

module.exports = {
  fail: fail,
  urlUpdate: urlUpdate,
  obj: generateVeAdsObject,
  setGlobalVeAdsObj: setGlobalVeAdsObj,
  unsetGlobalVeAdsObj: unsetGlobalVeAdsObj,
  addToDOM: addToDOM,
  clearDOM: clearDOM
};
