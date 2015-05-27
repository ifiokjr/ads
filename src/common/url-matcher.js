'use strict';


/** 
 * @module common/url-matcher 
 * 
 * @description 
 * Exported as a class, but should only be used as a singleton. Managed by the VeAdsController Class
 * 
*/

'use strict';

var utils = require('./utils'),
    $ = require('./jq'),
    matcher;


/**
 * Constants
 */

var MATCH_PROPERTY = '__MATCH__'; // Determines whether a URL matches




/**
 * Cached regular expressions for matching named param parts and splatted parts of route strings.
 */

var optionalParam = /\((.*?)\)/g;
var namedParam    = /(\(\?)?:\w+/g;
var splatParam    = /[*]{1}/g;
var doubleSplatParam = /[*]{2}/g; // when used, should be used alone
var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;


/**
 * @class Matcher
 * 
 * @description 
 * This class instantiates an object which stores the current url (constantly updates)
 * and checks to see that the urls passed to it relevant methods are relevant. 
 *
 * @method test -  takes in a url pattern (or regex), [params] and returns a boolean => Are we on the correct page
 * @method match - returns the matches found.
 */

function Matcher( pageURL ) {
  this.pageURL = pageURL || this.generatePageURL( );
  this.searchObject = this.generateSearchObject( );
  
  //TODO: watch for hashchanges, if we decide to capture the data
}


/** 
 * @method
 * @description
 * A method to access the page URL, allows for stubbing out window.location in the 
 * test suite
 * 
 * @api private
 * 
 * @returns {string} - the full page URL - this is likely to change. 
 */

Matcher.prototype._getPageURL = function( ) {
  if ( this.locationObj ) {
    return this.locationObj;
  } else {
    return this.locationObj = utils.parseURL( window.location.href );
  }
};


/**
 * @method
 * 
 * @returns {Object} - object of all the params  
 */

Matcher.prototype.generateSearchObject = function( ) {
  var urlObj = this._getPageURL( );
  return convertSearchToObject( urlObj.query );
};


/**
 * @method
 * 
 * @returns a lowercase url string without any unneccessary elements 
 */

Matcher.prototype.generatePageURL = function( ) {
  var urlObj = this._getPageURL( );
  var dirtyURL =  urlObj.hostname + ( (urlObj.pathname.length > 1) ? urlObj.pathname : '' ); // strip `/` when empty url
  
  return cleanURL(dirtyURL);
};


/**
 * @method
 * 
 * @api private
 * 
 * @description
 * Convert a pattern string into a regular expression, 
 * suitable for matching against the current page URL.
 * 
 * @param {string} pattern - the url pattern to transform into a regex object
 * 
 * @returns {RegExp} - used to run a test again the pageURL.
 */

Matcher.prototype._patternToRegex = function( pattern ) {
  pattern = pattern.replace(escapeRegExp, '\\$&')
    .replace(optionalParam, '(?:$1)?')
    .replace(namedParam, function(match, optional) {
      return optional ? match : '([^/?]+)';
    })
    .replace(doubleSplatParam, '([^?]+|[^?]?)') // greedy match!
    .replace(splatParam, '([^\\/?]*?)'); // .*? non-greed match http://forums.phpfreaks.com/topic/265751-how-does-it-work/
      
  return new RegExp('^' + pattern + '(?:\\?([\\s\\S]*))?$');
};



/**
 * @method
 * 
 * @api public
 * 
 * @description
 * The main method for checking if two urls match, taking into account params
 * 
 * @params {String|Object} pattern - a url pattern or object with a params pattern as well
 * patter can be an object with properties params, url, hash.
 * 
 * :TODO add a way of matching explicitly zero parameters (maybe params should default to null set to `{}` when strictly no params)
 */

Matcher.prototype.match = function( pattern ) {
  var obj = {},
      urlMatches,
      paramMatches,
      returnObj = {},
      _this = this;
  
  if ( !utils.type(pattern, 'object') ) {
    obj.url = pattern;
  }
  
  else {
    obj = pattern;
  }
  
  urlMatches = this.checkPatternMatches( obj.url );
  paramMatches = this.checkParamMatches( obj.params );
  
  if ( urlMatches[ MATCH_PROPERTY ] && paramMatches[ MATCH_PROPERTY ] ) {
    return $.extend( { }, urlMatches, paramMatches );
  }
  
  returnObj[ MATCH_PROPERTY ] = false;
  return returnObj;
  
};


/**
 * @method
 * 
 * @param {String} pattern - the pattern passed into the object
 * @param {String} item
 */

Matcher.prototype.checkPatternMatches = function( pattern, item ) {
  var regex, names, matches, bound = {}, captured, ii, name;
  
  bound[ MATCH_PROPERTY ] = false; // default to no match
  
  if ( !item ) { pattern = cleanURL( pattern ); }
  
  regex = this._patternToRegex( pattern );
  names = this._getNamedParameters( pattern );
  
  matches = regex.exec( item || this.pageURL ); // default to using the page url
  if ( !matches ) { return bound; }
  
  
  captured = matches.slice( 1 );
  bound[ MATCH_PROPERTY ] = true; // the URL matches
  
  for ( ii = 0; ii < captured.length; ii++ ) {
    name = names[ ii ];
    if ( !captured[ ii ] ) { continue; }
    
    if ( name === '_' ) {
      bound._ = bound._ || [ ];
      bound._.push( captured[ ii ] );
    } else {
      bound[ name ] = captured[ ii ];
    }
  }
  
  return bound;
};
  

/**
 * @method
 * 
 * Ensure that each specified parameter matches
 * 
 * @param {Object} params - specific url parameters to match to the current URL parameter
 */

Matcher.prototype.checkParamMatches = function( params ) {
  var obj, dObj, bound = { }, _this = this;

  bound[ MATCH_PROPERTY ] = true; // default to matching
  
  if ( !utils.objectLength( params ) ) { return bound; }
  
  $.each( params, function(key, value) {
    var dValue;
    
    key = String( key );
    value = String( value );
    dValue = decodeURIComponent( value );
    
    if ( _this.searchObject[key] == null ) {
      bound[ MATCH_PROPERTY ] = false;
      return false; // Break out from jQuery loop
    }
    
    obj = !_this.checkPatternMatches( value, _this.searchObject[key] );
    dObj = !_this.checkPatternMatches( dValue, _this.searchObject[key] );
    
    if ( obj[ MATCH_PROPERTY ] ) {
      $.extend( bound, obj );
      return; // Continue jQuery loop
    }
    
    else if ( dObj[ MATCH_PROPERTY ] ) {
      $.extend( bound, dObj );
      return; // Continue jQuery loop
    }
    
    else {
      
      bound[ MATCH_PROPERTY ] = false;
      return false; // Break out from jQuery loop
      
    }
  });
  
  return bound;
  
};
  


/**
 * @method
 * 
 * @api private
 * 
 * @description
 * Used to obtain any  named parameters from the URL
 */

Matcher.prototype._getNamedParameters = function ( pattern ) {
  var regex, names, results, name;
  regex = new RegExp( '((:?:[^\\/\(\)]+)|(?:[\*])|(?:[\*\*]))', 'g' );
  names = [ ];
  
  results = regex.exec( pattern );

  /*
   * Loop through until results is null.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#Example:_Finding_successive_matches
   * 
   * Perhaps change to not throw errors here. 
   */
  while ( results ) {
    name = results[1].slice(1);
    
    if ( name == '_' ) {
      throw new TypeError( ':_ can\'t be used as a pattern name in pattern: ' + pattern );
    }
    
    if ( $.inArray(name, names) > -1 ) {
      throw new TypeError( 'duplicate pattern name :' + name + ' in pattern: ' + pattern );
    }
    
    names.push( name || '_' );
    results = regex.exec( pattern );
  }
    
  return names;
};


/**
 * Exports `Matcher`
 */

module.exports = matcher = new Matcher();
matcher.MATCH_PROPERTY = MATCH_PROPERTY;
matcher.Matcher = Matcher;


/**
 * @function
 * 
 * @description
 * generate search object
 * 
 * @param {String} searchString - parameters passed into the URL
 */

function convertSearchToObject( searchString ) {
  if (searchString === '' || searchString === '?') { return {}; }
  var queries, ii, searchObject = {}, split;
  queries = searchString.replace(/^\?/, '').split('&');
  for(ii = 0; ii < queries.length; ii++) {
    split = queries[ii].split('=');
    searchObject[split[0]] = split[1];
  }
  return searchObject;
}


/**
 * @function
 * 
 * @description
 * remove unwanted items from a URL
 * takes `https://www.awesome.com/hello/my`
 * outputs => `awesome.com/hello/my`
 * 
 * @param {String} dirtyURL - parameters passed into the URL
 */

function cleanURL(dirtyURL) {
  try {
    var url = (dirtyURL + '').toLowerCase();
    url = url.replace(/http[s]?:\/\//, '');
    url = url.replace('#', '?');
    url = url.replace(';', '?');
    if( url.substr(0, 4) === 'www.' ) {
      url = url.replace('www.', '');
    }
    return url;
  } catch(err) {
    return '';
  }
}