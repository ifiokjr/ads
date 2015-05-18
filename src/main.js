/** 
 * Module Dependencies
 */

var utils = require('./common/utils');


/**
 * @module ./main
 * Expose `Main`.
 */

module.exports = Main;


/**
 * Page Type ID's. Useful for sorting
 */
var pageType = {
  
}


/**
 * @class Main
 * 
 * The `Main` class is responsible for glueing the whole script together
 * 
 * 1. Check whether the browser supports localStorage and JSON
 * 2. Use jQuery promises to handle async code sometimes failures happen.
 * 3. Check VeAds object structure (simple test)
 * 4. Create the pages using sort by order
 * 
 * @param {Object} config - the main veads object
 */

function Main( config ) {
  config = this.obtainConfig()
  
  this.sortPages()
  
}


/**
 * Checks and returns the config object
 * 
 * @param {Object} config - the main veAds object
 */

Main.prototype.cleanConfig = function check( config ) {
  if ( !config || !utils.type(config, 'object') ) {
    config = _getConfig();
  }
  
  return config
};


Main.prototype._getConfig = function( ) {
  
};

