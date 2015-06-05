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
    settings = require( '../settings' );


/**
 * Type of dataElements and whether they store lists or single values.
 * @type {Object}
 */

var types = {

  orderId: 'single',
  orderVal: 'single',
  productId: 'single',
  productList: 'list', // from basket page and category pages (limited to 5)
  productPrices: 'list', // from basket and category pages
  currency: 'single'
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

function DataElement(config) {

  this.storeConfig( config );

}


Emitter( DataElement.prototype );

/**
 * Store all the configuration for this data Element
 *
 *
 * @param  {Object} config - configuration as set up in the veAds tool
 *
 */

DataElement.prototype.storeConfig = function ( config ) {
  this.config = config;

  this.key = this.generateKey();
  this.id = config.id;
  this.capture = config.capture;

  this.key = this.generateKey();
};



/**
 * Capture the element from the page
 */
DataElement.prototype.setData = function ( ) {

  capture[this.capture.type]( this.config );

};


/**
 * obtain data from the storage
 *
 * @return {Mixed} value based on the key
 */
DataElement.prototype.getData = function ( ) {

};



DataElement.prototype.generateKey = function ( ) {
  return settings.fromObjectConfig('uuid') + this.type + this.id;
};


/**
 * Exports DataElement
 */

module.exports = DataElement;
