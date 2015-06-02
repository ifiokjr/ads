'use strict';

/**
 * Module Dependencies
 */

var utils = require('./common/utils'),
    Page = require('./pages/Page'),
    settings = require('./settings');


/**
 * @module ./main
 * Expose `Main`.
 */

module.exports = Main;


/**
 * Page Type ID's. Useful for sorting
 */

var pageTypeOrder = {
  ros: 1, // runs before all other pages ( automatically injected in );
  conversion: 2, // runs and if matched should prevent anything else from matching.
  product: 3,
  category: 4,
  basket: 5,
  custom: 6
};


/**
 * @class Main
 *
 * The `Main` class is responsible for glueing the whole script together
 *
 * 1. Check whether the browser supports localStorage and JSON
 * 2. Use jQuery promises to handle async code sometimes failures happen.
 * 3. Check VeAds object structure (simple test)
 * 4. Create the pages using sort by order
 *
 * @param {Object} [veAdsObj] - the main veads object
 */

function Main( veAdsConfig ) {
  this.veAdsConfig = veAdsConfig || this.getVeAdsConfig( );
  this.runChecks( ); // Check for browser compatibility
  this.instantiatePages( ); // Create all pages from the object
}


/**
 * @method
 * @public
 * Obtain the veAds object
 */

Main.prototype.getVeAdsConfig = function( ) {
  try {
    return $.extend( {}, window.veTagData.settings.veAds );
  } catch (e) {
    throw new Error( 'Please define a valid veAds object' );
  }
};



/**
 * @method
 * @public
 * Test for the existence of JSON
 */

Main.prototype.testJSON = function( ) {
  return window.JSON && 'parse' in JSON && 'stringify' in JSON;
};



/**
 * @method runChecks
 *
 * @public
 *
 * @description
 * Run checks and add scripts for missing functionality.
 * Provide jQuery promises that can be used to determine when functionality is available.
 */

Main.prototype.runChecks = function( ) {
  if ( !this.testJSON() ) {
    this.jsonAvailable = false;
    this.jsonPromise = $.getScript('https://cdnjs.cloudflare.com/ajax/libs/json3/3.3.2/json3.min.js');
  }
  else {
    this.jsonAvailable = true;
  }

};


/**
 * @method instantiatePages
 * @public
 *
 *  - Sort the pages based on `pageTypeOrder`
 * Loop through pages and add class to the page object
 */

Main.prototype.instantiatePages = function( ) {
  var _this = this;

  _this.veAdsConfig.pages.sort(pageSort); // Sort the pages according to type.

  $.each( _this.veAdsConfig.pages, function( index, pageObj ) {
    if ( pageObj[settings.MAIN_PAGE_PROPERTY] ) return; // Only generate instance if none currently exists

    var page = new Page( pageObj ); // CHECK: This may need certain parameters
    pageObj[settings.MAIN_PAGE_PROPERTY] = page;
  });
};


/**
 * @method setupPageListener
 * @api public
 *
 *  Pages have been instantiated so add listeners to them.
 */

 Main.prototype.setupPageListener = function( ) {
   var _this = this;
};


/**
 * Used to sort pages pages based on `pageTypeOrder` index
 */

function pageSort(a, b) {
  return pageTypeOrder[a.type] - pageTypeOrder[b.type];
}


/**
 * @method runPageElements
 *
 * This may need to have a different name as it's responsible for setting all
 * data on the current page, before they may need to be used in any pixels that
 * the page displays.
 *
 * @param  {PageObject} page the page object that will need to be checked
 */

Main.prototype.runPageElements = function (page) {

};

/**
 * @method runPagePixels
 *
 * Based on the page that is passed into this object apply some styles to
 *
 * @param  {PageObject} page - used to determine which pixels are running on this type or override.id
 * @return {[type]}      [description]
 */

Main.prototype.runPagePixels = function (page) {
  return;
};
