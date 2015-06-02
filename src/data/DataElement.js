/*************************************************************************************
 * @module `data\DataElement`                                                        *
 *                                                                                   *
 * Where we capture the dynamic elements that wil be used throughout the application *
 *************************************************************************************/


var utils = require( '../common/utils' );


/**
 * @constructor
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

}


/**
 * Exports DataElement
 */

module.exports = DataElement;
