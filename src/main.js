'use strict';

/**
 * Module Dependencies
 */

var utils = require('./common/utils'),
    $ = require( './common/jq' ),
    Page = require('./pages/Page'),
    store = require( './storage/store' ),
    DataElement = require('./data/DataElement'),
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
  return window.JSON && 'parse' in window.JSON && 'stringify' in window.JSON;
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
    if ( pageObj[settings.MAIN_PAGE_PROPERTY] ) { return; } // Only generate instance if none currently exists

    var page = new Page( pageObj ); // CHECK: This may need certain parameters
    pageObj[settings.MAIN_PAGE_PROPERTY] = page;
  });
};


/**
 * @method setupPageListener
 * @
 *
 *  Pages have been instantiated so add listeners to them.
 */

 Main.prototype.setupPageListeners = function( page ) {
  // var _this = this;

  // Bind to this using cross browser $.proxy instead of Function.prototype.Bind
  page.once( 'success', $.proxy(this.setPageElements, this, page) );


  // Currently is a potential for race conditions here. What if we runPagePixels
  // before some of the data becomes available.
  page.once( 'success', $.proxy(this.runPagePixels, this, page) );

  page.once( 'fail', $.proxy(page.off, page) );

};


/**
 * @method setupDataListeners
 *
 * Data Element has been instantiated and set so now listen for storage messages
 *
 * @param  {DataElement} dataElement - The dataElement being listened to.
 */

Main.prototype.setupDataListeners = function ( dataElement ) {
  dataElement.once('set', $.proxy(this.storeValue, dataElement.value, dataElement.key));
};


/**
 * @method storeValue
 *
 * store the value.
 *
 * @param  {String} value - Value to be saved between pages
 * @param  {String} key   - Key used to reference the value between pages
 */
Main.prototype.storeValue = function (value, key) {
  store.set(key, value);
};


/**
 * Used to sort pages pages based on `pageTypeOrder` index
 */

function pageSort ( a, b ) {
  return pageTypeOrder[a.type] - pageTypeOrder[b.type];
}


/**
 * @method setPageElements
 *
 * Sets all data on the current page, before they may need to be used in any pixels that
 * the page displays.
 *
 * The criteria is based on the Page ID.
 *
 * Ensure that two DataElements are not instantiated twice.
 *
 * @param  {PageObject} page the page object that will need to be checked
 */

Main.prototype.setPageElements = function ( page ) {

  // Loop through and check the elements that need to be set on this page.
  $.each(this.veAdsConfig.dataElements, function( index, dataElementConfig ) {
    var dataElementObject;

    // Data Element has already been set
    if ( dataElementConfig[settings.MAIN_DATA_ELEMENT] ) {
      return;
    }

    if ( utils.type(dataElementConfig.pages, 'array') && dataElementConfig.pages.length &&
         ($.inArray(page.id, dataElementConfig.pages) > -1) ) {

      dataElementObject = new DataElement( dataElementConfig, page );

      dataElementConfig[settings.MAIN_DATA_ELEMENT] = dataElementObject; // Store it, to avoid duplicates

      dataElementObject.setData( ); // Obtain and store the data to cookies or localStorage
    }

  });
};


/**
 * @method runPagePixels
 *
 * Implements the pixels onto the current page.
 *
 * TODO: Think about whether we need to defer this running.
 *
 * @param  {Page} page - used to determine which pixels are running on this type or override.id
 */

Main.prototype.runPagePixels = function ( page ) {

  // 1. Find all the pixels that run on this page.

  $.each(this.veAdsConfig.pixels, function( index, dataElementConfig ) {
    var dataElementObject;

    // Data Element has already been set
    if ( dataElementConfig[settings.MAIN_DATA_ELEMENT] ) {
      return;
    }

    if ( utils.type(dataElementConfig.pages, 'array') && dataElementConfig.pages.length &&
         ($.inArray(page.id, dataElementConfig.pages) > -1) ) {

      dataElementObject = new DataElement( dataElementConfig, page );

      dataElementConfig[settings.MAIN_DATA_ELEMENT] = dataElementObject; // Store it, to avoid duplicates

      dataElementObject.setData( ); // Obtain and store the data to cookies or localStorage
    }

  });

};
