'use strict';

/*************************************************************************************
 * @module `data\DataElement`                                                        *
 *                                                                                   *
 * Where we capture the dynamic elements that wil be used throughout the application *
 *************************************************************************************/


var utils = require( '../common/utils' ),
    capture = require( './capture' ),
    Emitter = require( '../common/emitter' ),
    store = require( '../storage/store' ),
    settings = require( '../settings' ),
    $ = require( '../common/jq' ),
    Page = require( '../pages/Page' ),
    types = require( './types' ),
    debug = require( '../common/debug' );






/**
 * Fallback defaults, cached here  - FIXME:
 * @type {Object}
 */

var fallbacks = {
  '__timestamp__': $.now(),
  '__random__': ('0000' + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
};

/**
 * @class
 *
 * A piece of data, either an Array, or a single value, used to set information
 * for storage in our store.
 *
 * Data is collected primarily from the DOM, but can also be applied from the
 * global scope via variables attached to the `window`.
 *
 * Data is also retrieved from the dataElement via pixels which may need them
 * in order to make up their
 *
 * @param {Object} config tell the data element what it needs to capture
 */

function DataElement( config, page ) {

  if (page instanceof Page) {
    this.page = page;
    this.currentPage = true; // This is being captured from the current page.
  }

  page = page || {};
  this.storeConfig( config, page );
  

}


Emitter( DataElement.prototype );

/**
 * Store all the configuration for this data Element
 *
 *
 * @param  {Object} config - configuration as set up in the veAds tool
 *
 */

DataElement.prototype.storeConfig = function ( config, page ) {
  this.config = config;
  this.name = config.name;
  this.type = config.type;
  this.valueType = types[config.type]; // single or list
  this.id = config.id;
  this.capture = config.capture;
  this.fallback = config.fallback; // the value to use if nothing else can be found.

  this.urlData = page.matchingURLs || [{}];
  this.key = this.generateKey(); // used for storage

  this.logger();
};

/**
 * @method logger
 * 
 * Set up logging for this class
 */

DataElement.prototype.logger = function() {
  this.log = debug('ve:dataElement:' + this.type + ':' + this.id);
};


/**
 * Capture the element from the page
 */
DataElement.prototype.setData = function ( ) {
  this.log( 'About to set data with the following object', this.config );
  capture[this.capture.type]( this.config, this );

};


/**
 * @method getValue
 * @api public
 *
 * obtain value from the cache, currently doesn't do much. However this should
 * be used rather than direct access to future proof the code.
 *
 * @return {String|Array} value based on the key
 */

DataElement.prototype.getValue = function ( ) {
  this.log('VALUE!!', this.value);
  var val = this.value || ((this.valueType === 'list') ? [] : '');
  this.log('#getValue with value', val);
  return val;
};


/**
 * Generate a unique key
 * @return {String} [description]
 */
DataElement.prototype.generateKey = function ( ) {
  return settings.fromObjectConfig('uuid') + this.type + this.id;
};



/**
 * Make value quickly available to observers of this object.
 *
 * @param  {String|Array} value value from DOM
 */

DataElement.prototype.cacheValue = function( value ) {
  this.lastUpdated = ($.now()); // currently not used but available for optimisations
  this.log('Caching value', value, this.lastUpdated);
  this.value = value;
};


/**
 * @method getFallback
 * @api public
 *
 * Either use the fallback value provided or if special case return a generated
 * timestamp or random number
 *
 * @return {String} Fallback value to return
 */
DataElement.prototype.getFallback = function ( ) {
  var fallback =  String( fallbacks[this.fallback] || this.fallback );
  this.log('#getFallback - The fallback value being obtained', fallback);
};


/**
 * Exports `DataElement`
 */

module.exports = DataElement;
