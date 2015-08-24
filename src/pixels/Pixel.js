'use strict';

/**
 * @module `pixels/Pixel`
 *
 * The class definition for our pixels which are added to the page.
 *
 */


var utils = require( '../common/utils' ),
    Emitter = require( '../common/emitter' ),
    pixelType = require( './type' ),
    logger = require( '../common/debug' ),
    $ = require( '../common/jq' );


/**
 * @class
 *
 * Pixel class which manages the pixel type and then runs the correct actions
 * based on where this type is able to run and whether any overrides have been
 * requested.
 *
 * We check for the overrides object
 *
 * @param {Object} config - taken directly from the options for this pixel
 * @param {Function} getDataElement - a function that allows for obtaining stored data.
 */

function Pixel( config, getData ) {
  this.storeConfig( config );
  this.logger();
}


Emitter( Pixel.prototype );

/**
 * @method run
 *
 * Called by the `main` object when a page with the correct type has been
 * identified.
 *
 *
 * @param  {Function} getData   The function used to retrieve the neccessary data
 * @param  {String} pageType    The page type calling firing for this pixel
 * @param  {Number} pageID      The unique page ID of the calling page
 */

Pixel.prototype.run = function (getData, pageType, pageID) {
  this.pages.push( pageID );
  this.data = this.collateData(this._pixel[pageType]['needs'], getData);
  this.generatePixels( this.data, this.config, pageType, pageID );
};


/**
 * @method storeConfig
 *
 * Store all config when first instantiating this function
 *
 * @param  {Object} config Defined settings generated manually or through the tool
 */

Pixel.prototype.storeConfig = function ( config ) {
  this.settings = config;
  this.config = config.config;
  this.id = config.id;
  this.type = config.type;
  this.name = config.name;
  this.overrides = config.overrides;
  this._pixel = pixelType[this.type];
  this.pages = [];
};


/**
 * @method logger
 *
 * Convenience method for generating a logging function scoped to this pixel
 */

Pixel.prototype.logger = function ( ) {
  this.log = logger('ve:pixel:' + this.type + ':' + this.id);
};


/**
 * @method collateData
 *
 * Obtain the data from the storage via the `main` orchestrator
 *
 * @param  {Array}   requiredData  An array of all the dataElement types needed
 * @param  {Function} fn           The function called to obtain all data from storage
 */

Pixel.prototype.collateData = function (requiredData, fn) {
  this.log('Collating data for: ', requiredData);
  return fn( requiredData, this );
};


/**
 * Checks the Pixel overrides object
 *
 * @param  {String} pageType The type of page we're currently on
 * @param  {Number} pageID   The ID of the current page
 * @return {Boolean}         True if we should proceed. False if not.
 */

Pixel.prototype.checkOverrides = function (pageType, pageID) {
  this.log( 'Checking for pixel OVERRIDES' );
  if ( !this.overrides.active ) { return true; } // Don't worry - run as normal

  // ROS is acceptable can
  if ( this.overrides.ros && (pageType === 'ros') && !this.overrides.pages.length ) { return true; }

  if ( !this.overrides.pages.length ) { return true; } // no page overrides run as normal


  if ( this.overrides.pages.length &&
    $.inArray(pageID, this.overrides.pages) > -1 ) {
    return true;
  }

  this.log( 'The pixel has been OVERRIDDEN' );
  return false;
};


/**
 * @method generatePixels
 *
 * Responsible for placing the actual pixels needed on the page.
 *
 * Also makes a small sense check to be sure that there are actually functions that
 * can be called here.
 *
 * @param  {Object} data        Dynamically generated data from dataElements
 * @param  {Object} config      The hardcoded config object directly from the tool
 * @param  {String} pageType    The page type calling firing for this pixel
 * @param  {Number} pageID      The unique page ID of the calling page
 * @return {Null}
 */
Pixel.prototype.generatePixels = function ( data, config, pageType, pageID ) {
  var runners, _this = this;

  // Check whether we have any overrides
  if ( !this.checkOverrides(pageType, pageID) ) {
    this.log( 'Pixels will not be generated' );
    return; // Don't do anything if page has been overriden
  }


  // Functions to be run
  runners = (this._pixel[pageType] && this._pixel[pageType]['produces']) || [];
  if ( !runners.length ) {
    this.log( 'There are ZERO runners for this pageType:' + pageType );
    return;
  }

  this.log( 'Generating Pixel(s) for: ' + this.name + ' with type: ' + this.type );
  this.log( 'Data to be passed in will be ', data, config );
  $.each(runners, function( index, runner ) {
    var src = runner( data, config, pageID );

    if (src) {
      utils.getImage( src );
      _this.log( 'Image pixel generated with `src`: ' + src );
    }
  });

};


/**
 * Exports `Pixel` Class
 */

module.exports = Pixel;
