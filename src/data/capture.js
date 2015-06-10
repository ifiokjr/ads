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
    masks = require( '../common/masks' ),
    log = require( '../common/debug' )('ve:capture');




/**
 * @exports capture
 *
 * Object allowing for quick usage with the dataElement objects to set elements
 */

module.exports = {

  selector: selector,

  globalVariable: globalVariable,

  url: url,

  dataLayer: dataLayer,

  dataLayerReverse: dataLayerReverse

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
 * @param  {String} value  - the value that was originally captured.
 * @param  {Object} config - original config object
 * @return {String|Array}  - single value or list of values
 */

function runTransformations( values, config ) {
  if ( utils.type(values, 'array') ) {
    log('#runTransformations - running on an array of values');
    $.each(values, function( index, value ) {
      values[index] = transform( value );
    });
    return values;
  }
  
  log('#runTransformations - single value type');
  return transform(values, config);
}

/**
 * Transform a single value string
 * @param  {String} value  - Value to be transformed
 * @param  {Object} config - original configuration object
 * @return {String}        - Individual value that has been transformed
 */
function transform( value, config ) {
  log('#transform - running on value');
  value = runRegex( value, config.regex );
  value = runMasks( value, config.mask );
  value = runMappings( value, config.mappings );
  return value;
}




var singleOrList = {

  /**
   * Checks element and returns a String
   * @param  {jQueryElement} $el - the element under question (only looks at first)
   * @return {String}     The value from the element
   */
  single: function( $el ) {
    return elements.obtainValue( $el );
  },

  /**
   * Checks elements and returns an array of their values (or text)
   * @param  {jQueryElements} $el - the elements being captured
   * @return {Array}     - An array of values to be transformed
   */
  list: function( $el ) {
    return elements.obtainValues( $el );
  }
};



/**
 * Stores the captured value onto the dataElement
 *
 * @param  {DataElement} dataElement - the dataElement being set.
 */
function storeData( dataElement, value ) {
  
  dataElement.cacheValue( value );
  dataElement.emit( 'store' );
}





/**
 * Parse Global Variables
 *
 * Split up and seperate by dots'. This can currently only match value and not
 * elements.
 *
 * @param {String} element - `helper.name` is called from the context of the window.
 *
 * @returns {String}       - currently we only support strings for this
 */

function parseGlobals( valueString ) {
  var context = window,
      splitByDots = valueString.split('.');

  $.each(splitByDots, function(index, value) {
    // Context stores the most recent value or context
    context = context[ splitByDots[index] ];
  });

  return String( context );
}



/**
 * Obtains value(s) from a dom selector.
 *
 * Can either be single or a list.
 *
 * @param  {Object} config - object containing the majority of the configuration
 * @param  {DataElement} dataElement - the dataElement we're working on
 */

function selector( config, dataElement ) {
  log('Running via DOM #selector', config, dataElement);
  var sel = config.capture.element,
      arrValue = [], value = '',
  fn = function ( $el, obj ) {
    log('#selector value found about to run transformations');
    value = singleOrList[dataElement.valueType]($el);
    value = runTransformations(value, config);
    storeData( dataElement, value );
  };


  // Very expensive, avoid using this!
  if ( config.capture.keepChecking && (dataElement.valueType !== 'list') ) {
    log('#selector keep checking active setting up progress check');
    elements.progressCheck( sel )
    .progress( fn );
  } else {
    log('#selector keep checking NOT active simpler check for element ');
    elements.dynamicCheck( sel )
    .then( fn );
  }
}



/**
 * Obtain a global variable from the window
 *
 * This currently only supports being run on a single value.
 * @param  {Object} config - object containing the majority of the configuration
 * @param  {DataElement} dataElement - the dataElement we're working on
 */

function globalVariable ( config, dataElement ) {
  var value = parseGlobals(config.capture.element);

  // cache the value
  storeData( dataElement, value );
}


/**
 * Obtain data from the captured values in the URL.
 *
 * @param  {Object} config - object containing the majority of the configuration
 * @param  {DataElement} dataElement - the dataElement we're working on
 */
function url( config, dataElement ) {
  var value = '';
  $.each(dataElement.urlData, function( index, obj ) {
    if ( obj.matches[config.capture.element] ) {
      value = obj.matches[config.capture.element];
      return false; // break the loop
    }
  });

  storeData( dataElement, value );
}



/**
 * Obtain from dataLayer
 */

function getFromDataLayer(key, reverse) {
  var dataLayer = window.dataLayer;
  if (!dataLayer) {
    return '';
  }

  var reverseDataLayer = reverse ? dataLayer.reverse() : dataLayer;
  var keyValue = '';
  for (var ii = 0; ii < reverseDataLayer.length; ii++) {
    if (reverseDataLayer[ii][key]) {
      keyValue = reverseDataLayer[ii][key];
      break;
    }
  }
  return keyValue;
}


/**
 * Obtain data from the dataLayer which some websites use (e.g. Etihad).
 *
 * @param  {Object} config - object containing the majority of the configuration
 * @param  {DataElement} dataElement - the dataElement we're working on
 */

function dataLayer( config, dataElement, reverse ) {
  var value = getFromDataLayer( config.capture.element, reverse );

  storeData( dataElement, value );
}


/**
 * Obtain data from the dataLayer which some websites use (e.g. Etihad).
 *
 * Reverse the array to only find most recent updates.
 *
 * @param  {Object} config - object containing the majority of the configuration
 * @param  {DataElement} dataElement - the dataElement we're working on
 */

function dataLayerReverse( config, dataElement ) {
  dataLayer( config, dataElement, true );
}
