/**
* Useful utilities that will be used throughout the codebase. 
* @ module
*/


// toString ref.
var toString = Object.prototype.toString;

module.exports = {
  
  parseURL: parseURL,
  type: type
  
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