'use strict';

/**
* Useful utilities that will be used throughout the codebase.
* @module `common`
*
* Pixel and script creation.
*/


var $ = require( './jq' );

/**
 * `toString` reference.
 * Store for later usage
 */

var toString = Object.prototype.toString;




/**
 * Exports methods defined below
 */

module.exports = {

  parseURL: parseURL,

  type: type,

  objectLength: objectLength,

  whenAny: whenAny,

  // Scripts and Image pixels

  getScript: getScript,

  getImage: getImage

};



/**
 * Return the correct URL and then expect it to work.
 *
 */

function parseURL( url ) {
  var a = document.createElement('a');
  a.href = url;

  return {
    element: a,
    href: a.href,
    host: a.host,
    port: '0' === a.port || '' === a.port ? '' : a.port,
    hash: a.hash,
    hostname: a.hostname,
    pathname: a.pathname.charAt(0) !== '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || ':' === a.protocol ? 'https:' : a.protocol,
    search: a.search,
    query: a.search.slice(1) // Nice utility for pre-stripping out the `?`
  };
}


 /**
 * Return the type of `val` or a boolean comparision.
 *
 * @param {Mixed} val - the element being tested against.
 * @param {string} testType[optional] - if passed in then th function returns a boolean
 * @return {Boolean | string} - returns a boolean if 2 parameters are passed in, otherwise returns a string
 *
 * @api public
 */

function type( val, testType ) {
  switch( toString.call(val) ) {
    case '[object Date]':
      return testType ? testType === 'date' : 'date';
    case '[object RegExp]':
      return testType ? testType === 'regexp' : 'regexp';
    case '[object Arguments]':
      return testType ? testType === 'arguments' : 'arguments';
    case '[object Array]':
      return testType ? testType === 'array' : 'array';
    case '[object Error]':
      return testType ? testType === 'error' : 'error';
  }

  if( val === null ) { return testType ? testType === 'null' : 'null'; }
  if( val === undefined ) { return testType ? testType === 'undefined' : 'undefined'; }
  if( val !== val ) { return testType ? testType === 'nan' : 'nan'; }
  if ( $ && (val instanceof $) ) {return testType ? testType === 'jquery' : 'jQuery'; }
  if( val && val.nodeType === 1 ) { return testType ? testType === 'element' : 'element'; }
  val = val.valueOf ? val.valueOf() : Object.prototype.valueOf.apply(val);
  return testType ? testType === typeof val : typeof val;
}


/**
 * Return the length of the current object
 *
 * @param {Object} obj - the object to be measured.
 *
 * @return {Number} - returns the length of the objects own elements
 *
 * @api public
 */

function objectLength( obj ) {
  var len = 0,
      key;
  for ( key in obj ) {
    if ( obj.hasOwnProperty(key) ) { len++; }
  }

  return len;
}


/**
 * Generate search object
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
 * Remove unwanted elements from a URL
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


/**
 * @api public
 *
 * Resolves when an array of promises are completed,
 * only stop when context argument is edited
 *
 * @param {Array} promiseArray - an array or promises to look through.
 * @param {Promise|Optional} [promise1, promise2, ...] - promise arguments
 *
 * @returns {jQueryPromise} -  promise notifies whenever element val or text changes.
 */

function whenAny( promiseArray ) {
  var finish = $.Deferred( );

  if ( arguments.length > 1 ) {
    promiseArray = Array.prototype.slice.call( arguments );
  }

  $.each( promiseArray, function( index, promise ) {

    promise.done( function( ) {
      var args = [].slice.call( arguments );
      finish.resolve.apply(finish, args )
    });
  });

  return finish.promise( );
}



/**
 * A wrapper around the inbuilt jQuery getScript function
 * Here we just force caching to be turned on.
 *
 * @param  {String} src - The URL to obtain our script from
 *
 * @return {jQueryPromise}     A jQuery promise with .done and .then methods.
 */

function getScript( src, cb ) {
  return $.ajax( {
		type: 'GET',
		url: src,
		data: null,
		success: cb,
		dataType: 'script',
    cache: true
  });
}


/**
 * Rather than adding a pixel to the DOM we take advantage of the infamous
 * `web bug` (beacon) to generate a transparent `GET` request for an image
 * pixel.
 *
 * Much more performant
 *
 * @param  {String} src - pixel URL
 * @return {jQueryPromise}     A promise with `.done` and `.then` methods
 *                             for chaining.
 */

function getImage( src ) {
  var image = new Image(1, 1),
      deferred = $.Deferred( );

  image.onload = function() {
    console.log('YAY!!')
    deferred.resolve( );
  };

  image.src = src;

  return deferred.promise( );
}

global.getImage = getImage;
