'use strict';

/**
 * @module `pixels/Pixel`
 *
 * The class definition for our pixels which are added to the page.
 *
 */


var utils = require( '../common/utils' );


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
 * @param {Function} getData - a function that allows for obtaining stored data.
 */
function Pixel( config, getData ) {
  if ( !utils.type(getData, 'function') ) {
    throw new TypeError( 'A `getData` Function needs to be passed in.' );
  } 
}





/**
 * Exports `Pixel` Class
 */

module.exports = Pixel;
