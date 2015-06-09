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
    settings = require( '../settings' ),
    elements = require( '../common/elements' ),
    criteria = require( '../common/criteria' ),
    debug = require( '../common/debug' );



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
  
  //TODO: Avoid throwing errors here. 
  if ( !utils.type(config, 'object' ) ) {
    throw new Error ( 'Pages need to be called with a configuration object' );
  }

  this.storeConfig( config );
  this.logger();
  
  this.matchingURLs = [ ];

  this.dynamic = this._checkDynamic( ); // Boolean
  // this.checkURLs(); // Only check urls at the right time
  
  this.log('Page object created');
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
  this.log('Checking through URLs');
  $.each(this.urls, function( index, url ) {
    var matches = matcher.match( url );

    if ( matches[matcher.MATCH_PROPERTY] ) {
      _this.matchingURLs.push( {url: url, mathches: matches} );
    }
  });

  // emit matched URLs with the matched URLs when a match is found
  // debugger;
  if ( this.matchingURLs.length && !this.dynamic ) {
    // this.emit( 'success', this );
    this.pageIdentified( );
  } else if ( this.matchingURLs.length && this.dynamic ) {
    this.runDynamics( );
  } else {
    this.emit( 'fail' );
    this.log( 'ZERO MATCHES for: ' + this.name );
  }

};



/**
 * @method
 *
 * Runs through the dynamic identifiers and emits success when one is matched
 * TODO: Needs testing!
 *
 * @api public
 */

Page.prototype.runDynamics = function( ) {
  var promises = [],
      _this = this;
  
  this.log('Dynamically testing');
  $.each( this.dynamicIdentifiers, function( index, identifier) {
    var promise;
    // Stop if there is no selector, or criteria without a value.
    if ( !identifier.selector || (identifier.criteria && !identifier.values) ) {
      _this.log( 'Dynamic Identifier: ' + index+ 1 + ' can\'t run', identifier );
      return 'continue';
    }


    promise = elements.progressCheck( identifier.selector );
    promises.push( promise );
    // check current value against criteria each time.
    promise.progress( function( $el, obj ) {
      _this.log( 'Update in element value', $el, obj );
      $.each( identifier.values, function( index, value ) {
        _this.log('Checking agains: ' + value );
        if ( criteria[identifier.criteria](value, obj.value) ) {
          _this.log('Value has been found for: ' + obj.value );
          obj.remove( true ); // Cause promise to be resolved.
          return false; // Stop the iteration
        }
      });

      if ( _this.stopChecks ) {
        _this.log( 'Another dynamic Identifier has already passed' );
        obj.remove( ); // Cause promise to fail.
      }
    });
  });

  // As soon as one dynamicIdentifier
  // TODO: Fix problem with ghost identifiers running long after resolution
  utils.whenAny( promises )
  .done( function( $el ) {
    
    _this.pageIdentified( );
  });
};



/**
 * @method
 *
 * Runs through the urls and return the first  the callback
 *
 * @param {jQueryElement|Optional} $el - only passed when dynamicallyIdentified, not currently used
 * @api public
 */

Page.prototype.pageIdentified = function( $el ) {
  this.log( 'Page Matches for: ' + this.name, this.matchingURLs );
  this.stopChecks = true; // Stops any other intervals from running;
  this.emit( 'success', this );
  
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

  this.config = config; // Just in case we ever need to look back here.

  this.id = config.id;
  this.urls = config.urls ||  [];
  this.type = config.type || settings.DEFAULT_PAGE_TYPE;
  this.dynamicIdentifiers = config.dynamicIdentifiers || [];
  this.name = config.name;
};


/**
 * @method
 * 
 * Set up logger for this instance of page
 */
Page.prototype.logger = function() {
  this.log = debug( 've:page:' + this.type +':' + this.id );
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
