/** 
 * @module common/url-matcher 
 * 
 * @description Exported as a class, but should only be used as a singleton. Managed by the VeAdsController Class
 * 
*/

var utils = require('./utils');


/**
 * @class URLMatcher
 * 
 * @classdesc This class instantiates an object which stores the current url (constantly updates)
 * and checks to see that the urls passed to it relevant methods are relevant. 
 *
 * @method test -  takes in a url pattern (or regex), [params] and returns a boolean => Are we on the correct page
 * @method match - returns the matches found.
 * 
 */
function URLMatcher( ) {
  this.pageURL = this.generatePageURL( );
  
  //TODO: watch for hashchanges, if we decide to capture the data
}


/*
 * @description
 * A method to access the page URL, allows for stubbing out window.location in the 
 * test suite
 * 
 * @method
 * @private
 * 
 * @returns {string} - the full page URL - this is likely to change. 
 */
URLMatcher.prototype._getPageURL = function( ) {
  return utils.parseURL(window.location.href);
};



/**
 * @method
 */
URLMatcher.prototype.generatePageURL = function( ) {
  var urlObj = this._getPageURL( );
  return urlObj.hostname + ( (urlObj.pathname.length > 1) ? urlObj.pathname : '' ); // strip `/` when empty url
};



module.exports = URLMatcher;