'use strict';

/**
 * @module `data/capture`
 *
 * used to set the variable depending on what has been passed into the object
 */

var utils = require( '../common/utils' ),
    elements = require( '../common/elements' ),
    $ = require( '../common/jq' ),
    escapeRegExp = require('../common/url-matcher' ).escapeRegExp,
    masks = require( '../common/masks' );


/**
 * @exports capture
 *
 * Object allowing for quick usage with the dataElement objects to set elements
 */

module.exports = {

  selector: selector,

  globalVariable: globalVariable,

  url: url,

};


/**
 * Run through the regex matchers, followed by the regex exclusions
 *
 * @param  {String} value    - initial value to be transformed
 * @param  {Object} regexObj - provided by the dataElement.regex setting
 * @return {String}          - transformed string value
 */

function runRegex( value, regexObj ) {
  var inclusions = regexObj.include,
      exclusions = regexObj.exclude;

  if ( utils.type(inclusions, 'string') ) {
    inclusions = [ inclusions ];
  }

  if ( utils.type(exclusions, 'string') ) {
    exclusions = [ exclusions ];
  }

  if ( utils.type(inclusions, 'array') && inclusions.length ) {
    value = match( value, inclusions );
  }

  if ( utils.type(exclusions, 'array') && exclusions.length ) {
    value = replace( value, exclusions );
  }

  return value;

}


/**
 * Replace values via regex from exclusions array - used to transform values
 *
 * At the moment this defaults to global and case insensitive as we want to avoid
 * using regex literals in the config settings.
 *
 * @param  {String} value      - initial value to match against
 * @param  {Array} inclusions  - list of regex transformations to linearly match
 * @return {String}            - updated value
 */

function replace( value, exclusions ) {
  $.each( exclusions, function( index, regexString ) {
    var regexObj;

    // Make sure string properly escaped
    regexString = regexString.replace(escapeRegExp, '\\$&');

    // currently hardcode global replace
    regexObj = new RegExp( regexString, 'gi');
    value = value.replace(regexObj, '');
  });

  return value;
}


/**
 * Used to match regex expressions
 *
 * At the moment when there is now match found we keep the value.
 *
 *
 * @param  {String} value      - initial value to match against
 * @param  {Array} inclusions  - list of regex transformations to linearly match
 * @return {String}            - updated value
 */

function match( value, inclusions ) {
  $.each( inclusions, function( index, regexString ) {
    var regexObj;

    // Make sure string properly escaped
    regexString = regexString.replace( escapeRegExp, '\\$&' );

    // currently hardcode global replace
    regexObj = new RegExp( regexString, 'gi');
    value = value.match(regexObj)[1] || value; // If no match found we keep the value;
  });

  return value;
}


/**
 * Obtains value(s) from a dom selector
 *
 * @param  {Object} config
 * @param  {DataElement} dataElement - the dataElement we're working on
 * @return {String|Array}
 */

function selector( config, dataElement ) {

  var sel = config.capture.element,
      arrValue = [], value = '';

  if ( config.capture.keepChecking ) {

  } else {
    elements.dynamicCheck( selector )
    .then( function( $el ) {
      value = elements.obtainValue( $el );

      dataElement.emit('set', value);
    });
  }
}


/**
 * Transform the value passed in with the automatic masks that are run.
 * @param  {String} value current value
 * @param  {String} mask  masking function to be used
 * @return {String}       Value run through strings
 */
function runMasks( value, mask ) {
  var fn = masks[mask] || masks['nothing'];
  return fn(value);
}


/**
 * Takes in a value (as key) and maps it to the corresponding value.
 *
 * @param  {String} value    Initial value passed in.
 * @param  {Object} mappings Transform a value based on predefined map.
 * @return {String}          Updated value where mappings are present.
 */

function runMappings( value, mappings ) {
  if ( !utils.objectLength(mappings) ) {
    return value;
  } else {
    return mappings[value] || value;
  }

}


/**
 * String together all of the value transformations that are possible.
 * @param  {[type]} value  [description]
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
function runTransformations(value, config) {
  value = runRegex( value, config.regex );
  value = runMasks( value, config.mask );
  value = runMappings( value, config.mappings );
  return value;
}


/**
 * Obtain a global variable from the window
 * @return {[type]} [description]
 */

function globalVariable () {

}

/**
 * Obtain data from the URL captured values
 * @return {[type]} [description]
 */
function url() {

}
