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

  obtainValue: obtainValue,

  obtainValues: obtainValues

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
  if ( !utils.type($el, 'jquery') ) { $el = $( $el ); }


  if ( !$el.length ) { return ''; }

  $el = $el.first(); // only return value for the first object found from selector.

  if ( $el.val( ) ) {
    return $.trim( $el.val( ) );
  } else {
    return $.trim( $el.text( ) );
  }
}


/**
 * Returns an array of values for each element that has been found.
 * @param  {jQueryElement} $el - Element from which to extract values
 * @return {[type]}     [description]
 */
function obtainValues( $el ) {
  var values = [];


  $el.each( function( index, el ) {
    var value = obtainValue( el );
    values.push( el );
  });
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
 * :FIXME - Currently only gets cleaned after udpate
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

  // it doen't feel right setting values.
  obj.remove = function (success) {
    if ( success ) { obj.complete = true; }
    else { obj.fail = true; }
  };

  if ( $el.length ) {
    obj.value = obtainValue( $el );
    deferred.notify( $el, obj );
  }

  interval( function( ) {
    $el = instantCheck( selector );
    obj.value = obtainValue( $el );
    if ( !utils.type(obj.value, 'nan') && !utils.type(obj.value, 'undefined') &&
        !utils.type(obj.value, 'null') &&  (oldVal !== obj.value) ) {

      oldVal = obj.value;
      deferred.notify( $el, obj );
    }

    if ( obj.complete ) {
      deferred.resolve( $el );
      return true; // Clears the interval
    }

    if ( obj.fail ) {
      deferred.reject( );
      return true; // Clears the interval
    }

  });

  return deferred.promise( );
}
