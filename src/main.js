'use strict';

/**
 * Module Dependencies
 */

var utils = require( './common/utils' ),
    $ = require( './common/jq' ),
    Page = require( './pages/Page' ),
    store = require( './storage/store' ),
    DataElement = require( './data/DataElement' ),
    settings = require( './settings' ),
    pixelTypes = require( './pixels/type' ),
    debug = require( './common/debug' ),
    elementTypes = require( './data/types' ),
    Pixel = require( './pixels/Pixel' );


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

var injectableROS = {
  id: 0,
  name: 'ROS Injected Page',
  type: 'ros',
  // An empty array will never match.
  urls: ['**'], // Match everything
  dynamicIdentifiers: []
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
  var _this = this;
  this.log = debug( 've:main' );
  this.veAdsConfig = veAdsConfig || this.getVeAdsConfig( );
  this.runChecks( ) // Check for browser compatibility

  .then( function() {
    _this.instantiatePages( ); // Create all pages from the object
  });

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
    this.log( new Error( 'Please define a valid veAds object' ), e );
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
  var deferred = $.Deferred( ); // set up a jQuery deferred
  if ( !this.testJSON() ) {
    this.log( 'NO JSON on this page, adding a script to the page.');
    this.jsonAvailable = false;
    this.jsonPromise = $.getScript('https://cdnjs.cloudflare.com/ajax/libs/json3/3.3.2/json3.min.js')
    .done(function() {
      deferred.resolve();
    });
  }

  else {
    this.jsonAvailable = true;
    this.log('JSON natively available');
    deferred.resolve( );
  }

  return deferred.promise();

};


/**
 * Check that a property value resides within an array of objects
 *
 * @param  {Array} array     Array of objects
 * @param  {String} property The property to check
 * @param  {String} value    The value to test against
 * @return {Boolean}         Result of the test
 */
function propertyValueInObjectArray(array, property, value) {
  var answer = false;
  $.each(array, function(index, object) {
    if ( object[property] === value ){
      answer = true;
      return false;
    }
  });

  return answer;
}

/**
 * @method instantiatePages
 * @public
 *
 *  - Sort the pages based on `pageTypeOrder`
 * Loop through pages and add class to the page object
 */

Main.prototype.instantiatePages = function( ) {
  this.log( 'Instantiating PAGES' );
  var _this = this;

  if ( !propertyValueInObjectArray(this.veAdsConfig.pages, 'type', 'ros') ){
    this.veAdsConfig.pages.unshift(injectableROS); // Add ROS page to the front of the queue
  }
  this.veAdsConfig.pages.sort(pageSort); // Sort the pages according to type.

  this.log('Pages have been sorted into a running order', this.veAdsConfig.pages);
  $.each( _this.veAdsConfig.pages, function( index, pageObj ) {
    if ( pageObj[settings.MAIN_PAGE_PROPERTY] ) { return 'continue'; } // Only generate instance if none currently exists

    var page = new Page( pageObj ); // CHECK: This may need certain parameters
    pageObj[settings.MAIN_PAGE_PROPERTY] = page;
    _this.setupPageListeners( page );
  });
};


/**
 * @method setupPageListener
 * @
 *
 *  Pages have been instantiated so add listeners to them.
 */

Main.prototype.setupPageListeners = function(page) {
  this.log( 'Setting page listener for: ' + page.name );

  // Bind to this using cross browser $.proxy instead of Function.prototype.Bind
  page.once('success', $.proxy(this.setPageElements, this, page));


  // Currently is a potential for race conditions here. What if we runPagePixels
  // before some of the data becomes available.
  page.once('success', $.proxy(this.runPagePixels, this, page));

  page.once('fail', $.proxy(page.off, page));
  
  // Launch this
  page.checkURLs();

};


/**
 * @method setupDataListeners
 *
 * Data Element has been instantiated and set so now listen for storage messages
 *
 * @param  {DataElement} dataElement - The dataElement being listened to.
 */

Main.prototype.setupDataListeners = function ( dataElement ) {
  this.log('#setupDataListeners - setting up data listeners for: ' + dataElement.name, dataElement);
  dataElement.once('store', $.proxy(this.storeValue, this, dataElement));
};


/**
 * @method storeValue
 *
 * store the value.
 *
 * @param  {String} value - Value to be saved between pages
 * @param  {String} key   - Key used to reference the value between pages
 */
Main.prototype.storeValue = function ( dataElement ) {
  var key = dataElement.key, value = dataElement.getValue();
  this.log('#storeValue - storing key: ' + key + ', with value: ' + value );
  return store.set( key, value );
};


/**
 * Get the value from storage.
 *
 * @param  {String} key Unique Key for storage
 * @return {[type]}     [description]
 */
Main.prototype.getValue = function ( key ) {
  return store.get( key );
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
  this.log( 'Setting DataElements for identified page ' + page.name, page );
  var _this = this;
  
  // Loop through and check the elements that need to be set on this page.
  $.each(this.veAdsConfig.dataElements, function( index, dataElementConfig ) {
    var dataElementObject;

    // Data Element has already been set
    if ( dataElementConfig[settings.MAIN_DATA_ELEMENT] ) {
      _this.log( 'dataElement object already exists for dataElement: '+ dataElementConfig.name, dataElementConfig );
      dataElementObject = dataElementConfig[settings.MAIN_DATA_ELEMENT];
      dataElementObject.setData( );
      return 'continue'; // Move onto the next one.
    }

    if ( utils.type(dataElementConfig.pages, 'array') && dataElementConfig.pages.length &&
         ($.inArray(page.id, dataElementConfig.pages) > -1) ) {

      dataElementObject = new DataElement( dataElementConfig, page );

      dataElementConfig[settings.MAIN_DATA_ELEMENT] = dataElementObject; // Store it, to avoid duplicates
      _this.setupDataListeners( dataElementObject );
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
  var _this = this,
      getDataFn = $.proxy(this.obtainDataFromStorage, this );
  // 1. Find all the pixels that run on this page.

  $.each(this.veAdsConfig.pixels, function( index, pixelConfig ) {
    var pixel, type = pixelTypes[pixelConfig.type];

    // Check if this pixel runs on the page type.
    if ( !type.hasOwnProperty(page.type) ){
      _this.log( 'Page type: ' + page.type + ' not supported by pixel: ' + pixelConfig.name );
      return 'continue'; // Continue to next iteration
    }

    // Data Element has already been set
    if ( pixelConfig[settings.MAIN_PIXEL] ) {
      pixel = pixelConfig[settings.MAIN_PIXEL];
    } else {
      pixel = new Pixel( pixelConfig, getDataFn );
      pixelConfig[settings.MAIN_PIXEL] = pixel;
    }
    pixel.run( getDataFn, page.type, page.id );
  });
};



/**
 * @method obtainDataFromStorage
 *
 * Here we look through the dataElements and obtain all the stored values, either
 * directly from an instance, or via their stored value.
 *
 * @param  {Array} requiredData Array of dataElement types that we need to use.
 * @param  {Pixel} pixelObject  The pixel this is being used for
 */
Main.prototype.obtainDataFromStorage = function ( requiredData, pixelObject ) {
  var _this = this,
      data = {};

  $.each(requiredData, function ( index, dataType ) {
    var matchingDataElements =
      generateArrayOfMatchingTypes( _this.veAdsConfig.dataElements, dataType);

    data[dataType] = _this._obtainDataValue( matchingDataElements, elementTypes[dataType] );

  });

  return data;
};



/**
 * @method _obtainDataValue
 * @api private
 *
 * From an array of dateElements pluck one value,
 * 1 - first check value of object
 * 2 - look up value in storage when no current value
 * 3 - last of all use a fallback value for single data elements
 * 4 - rinse and repeat, with last added element winning
 *
 * @param  {Array} elements   List of config objects
 * @param  {String} valueType single or list
 * @return {String|Array}     The item that has been found
 */

Main.prototype._obtainDataValue = function( elements, valueType ) {
  var currentValue = (valueType === 'list' ? [] : ''),
      _this = this;

  $.each(elements, function( index, element ) {
    var dataElement = element[settings.MAIN_DATA_ELEMENT] ||
                    (element[settings.MAIN_DATA_ELEMENT] = new DataElement( element ) );
    if ( dataElement.valueType === 'single' && !currentValue ) {
      currentValue = dataElement.getValue() || _this.getValue(dataElement.key);
    } else {
      currentValue = listChecks( dataElement, currentValue, _this );
    }

  });

  // Only run this to obtain fallbacks and only when `valueType` is single
  if ( valueType === 'single' && !currentValue ) {
    $.each( elements, function (index, element) {
      var dataElement = element[settings.MAIN_DATA_ELEMENT];
      currentValue = dataElement.getFallback();
    });
  }

  return currentValue;
};



/**
 * Check through values for items that take a list since an empty array
 * is truthy in javascript.
 *
 * @return {Array}              Current value, updated or not.
 */

function listChecks( dataElement, currentValue, context ) {
  if ( dataElement.getValue().length ){
    return dataElement.getValue();
  }

  // Look within storage
  var storageValue = context.getValue(dataElement.key);

  if( storageValue.length ) {
    return storageValue;
  }

  return currentValue || [];
}


/**
 * Generates an array of matching types based on the objects passed in.
 *
 * @param  {Array<Object>} objects Array of objects to match
 * @param  {String} types          Type to be checked against
 * @return {Array<Objects>}        The objects with matching types are passed back
 */

function generateArrayOfMatchingTypes (objects, type) {
  var arr = [];
  $.each(objects, function (index, obj) {
    if ( obj.type === type ) {
      arr.push( obj );
    }
  });

  return arr;
}
