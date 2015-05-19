/**
* Useful utilities that will be used throughout the codebase. 
* @ module `common
*/


/**
 * `toString` reference.
 * Store for later usage
 */ 
var toString = Object.prototype.toString;



module.exports = {
  
  parseURL: parseURL,
  
  type: type,
  
  objectLength: objectLength
  
  
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
  switch(toString.call(val)) {
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
  if(val === null) return testType ? testType === 'null' : 'null';
  if(val === undefined) return testType ? testType === 'undefined' : 'undefined';
  if(val !== val) return testType ? testType === 'nan' : 'nan';
  if(val && val.nodeType === 1) return testType ? testType === 'element' : 'element';
  val = val.valueOf ? val.valueOf() : Object.prototype.valueOf.apply(val);
  return testType ? testType === typeof val : typeof val;
};


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