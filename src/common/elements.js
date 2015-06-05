'use strict';

/**
 * @module common/elements
 *
 * Functions for looking up elements in the dom (utilises jQuery broken
 * promise implementation - beware).
 */

var settings = require( '../settings' ),
    $ = require( './jq' ),
    utils = require( './utils' );

var elements;


/**
 * Expose `elements` object.
 */

module.exports = elements = {
  instantCheck: instantCheck,

  dynamicCheck: dynamicCheck,

  progressCheck: progressCheck,
  
  obtainValue: obtainValue

};


/**
 * @api public
 *
 * Check for element value, and fallback to element text.
 *
 * @param {jQueryElement} $el - Element to check.
 *
 * @returns {String} - The value obtained from this element.
 */

function obtainValue( $el ) {
  if ( utils.type($el, 'string') ) { $el = $( $el ); }

  if ( !$el.length ) { return ''; }

  if ( $el.val( ) ) {
    return $.trim( $el.val( ) );
  } else {
    return $.trim( $el.text( ) );
  }
}


/**
 * @api private
 *
 * This function provides the interval that is used to create our promises
 * Defaults are taken from the settings object
 *
 * @param {Function} cb - the callback to be run on each interval.
 *
 * @returns {Number} - the interval id so it can be cleared
 */

function interval( cb ) {
  var runTimes, ms, maxRetries;

  runTimes = 0;
  ms = settings.ELEMENT_MS;
  maxRetries = settings.ELEMENT_MAX_RETRIES;

  var calledInterval = setInterval( function() {
    var stopRunning = cb( );
    runTimes++;
    if ( stopRunning || (maxRetries && (runTimes >= maxRetries)) ) {
      clearInterval( calledInterval );
    }
  }, ms );

 return calledInterval; // allow the interval to be cleared;
}


/**
 * @api public
 *
 * Immediately check for the existense of the selector and return.
 *
 * @param {String} selector - used to generate a jQuery object
 *
 * @returns {jQueryObject} - an element to be returned by the receiver
 */

 function instantCheck( selector ) {
   return $( selector );
 }


/**
 * @api public
 *
 * Immediately check for the existense of the selector and return.
 *
 * @param {String} selector - the string used to check for element presence
 *
 * @returns {jQueryPromise} -  promise resolved as soon as element is found
 */

function dynamicCheck( selector ) {
  var $el = instantCheck( selector ),
      deferred = $.Deferred( );

  if( $el.length ) { // avoid intervals where not needed.
    deferred.resolve( $el );
  }

  interval( function( ) {
    $el = instantCheck( selector );

    if ( $el.length ) {
      deferred.resolve( $el ); // Promise should now be resolved
      return true;
    }
    return false;
  });

  return deferred.promise( );
}


/**
 * @api public
 *
 * Immediately check for the existence of the selector, notify on change,
 * only stop when context argument is edited
 *
 * @param {String} selector - the string used to check for element presence
 *
 * @returns {jQueryPromise} -  promise notifies whenever element val or text changes.
 */

function progressCheck( selector ) {
  var obj = { complete: false, value: null, fail:  false },
      oldVal = null,
      $el = instantCheck( selector ),
      deferred = $.Deferred( );

  if ( $el.length ) {
    obj.value = obtainValue( $el );
    deferred.notify( $el, obj );
  }

  interval( function( ) {
    if ( obj.complete ) {
      deferred.resolve( $el );
      return true; // Clears the interval
    }

    if ( obj.fail ) {
      deferred.reject( );
      return true; // Clears the interval
    }

    $el = instantCheck( selector );
    obj.value = obtainValue( $el );
    if ( !utils.type(obj.value, 'nan') && !utils.type(obj.value, 'undefined') &&
        !utils.type(obj.value, 'null') &&  (oldVal !== obj.value) ) {

      oldVal = obj.value;
      deferred.notify( $el, obj );
    }
  });

  return deferred.promise( );
}
