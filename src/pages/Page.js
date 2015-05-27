'use strict';


/**
 * @module pages/Page
 * 
 * Class for the central pages used to match the type
 */

var utils = require( '../common/utils' ),
    Emitter = require( '../common/emitter' ),
    matcher = require( '../common/url-matcher' ),
    $ = require( '../common/jq' ),
    settings = require( '../settings' );




/**
 * @constructor
 * 
 * Represents a Page class within the VeAds object. 
 * 
 * A page is central to the way VeAds functions. Matches this page and is used to provide
 * a unique id to identify the pages that elements should be got and set from. 
 * 
 * @param {object} config - takes in an object with configuration attached [REQUIRED]
 */

function Page( config ) {
  if ( !utils.type(config, 'object' ) ) {
    throw new Error ( 'Pages need to be called with a configuration object' );
  }
  
  this.storeConfig( config );
  this.matchingURLs = [ ];

  this.dynamic = this._checkDynamic( ); // Boolean
  this.checkURLs();
}


/**
 * @mixin
 * 
 * Add emitter methods to Page which will be listend to by main runner
 * Seperation of concerns. 
 */

Emitter( Page.prototype );


/**
 * @method
 * 
 * Runs through the urls and return the first  the callback 
 *
 * @return {Object} returns the first matching page obj
 * @api public
 */

Page.prototype.checkURLs = function( ) {
  var _this = this;
  
  $.each(this.urls, function( index, url ) {
    var matches = matcher.match( url );
    
    if ( matches[matcher.MATCH_PROPERTY] ) {
      _this.matchingURLs.push( {url: url, mathches: matches} );
    }
  });
  
  // emit matched URLs with the matched URLs when a match is found
  if ( this.matchingURLs.length & !this.dynamic ) {
    this.emit( 'success', this );
  } else {
    this.emit( 'fail' );
  }
  
};


/**
 * @method
 * 
 * Runs through the urls and return the first  the callback 
 *
 * @param {Object} config - returns the first matching page obj
 * @api public
 */

Page.prototype.storeConfig = function( config ) {
  
  // Make sure id is present
  if ( !utils.type(config.id, 'number') ) {
    throw new Error('Must provide an ID with every page ', config);
  }
  
  if ( !utils.type(config.type, 'string') ) {
    throw new Error( 'Must be provided with a valid type' );
  }
  
  this.config = config;
  
  this.id = config.id;
  this.urls = config.urls ||  [];
  this.type = config.type || settings.DEFAULT_PAGE_TYPE;
  this.dynamicIdentifiers = config.dynamicIdentifiers || undefined;
  this.name = config.name;
};



/**
 * @method
 * 
 * Checks wether we are on a page that needs a dynamic identifier 
 *
 * @api private
 */

Page.prototype._checkDynamic = function(  ) {
  return !!this.dynamicIdentifiers.length;
};


/**
 * Expose `Page` Class.
 */

module.exports = Page;
