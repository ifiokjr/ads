var type = require('./type');

// Object.create 
if (!type(Object.create, 'function')) {
  Object.create = (function() {
    var Temp = function() {};
    return function (prototype) {
      if (arguments.length > 1) {
        throw Error('Second argument not supported');
      }
      
      if (typeof prototype != 'object') {
        throw TypeError('Argument must be an object');
      }
      Temp.prototype = prototype;
      var result = new Temp();
      Temp.prototype = null;
      return result;
    };
  })();
}


// Allow for obtaining object size from any object 
if(!type(Object.size, 'function')) {
  Object.size = function(obj) {
    var size = 0,
      key;
    for(key in obj) {
      if(obj.hasOwnProperty(key)) {size++;}
    }
    return size;
  };
}

// forEach
// http://javascript.boxsheep.com/polyfills/Array-prototype-forEach/
if(!Array.prototype.forEach) {
  Array.prototype.forEach = function(callbackfn, thisArg) {
    var O = Object(this),
      lenValue = O.length,
      len = lenValue >>> 0,
      T,
      k,
      Pk,
      kPresent,
      kValue;
    if(typeof callbackfn !== 'function') {
      throw new TypeError();
    }
    T = thisArg ? thisArg : undefined;
    k = 0;
    while(k < len) {
      Pk = k.toString();
      kPresent = O.hasOwnProperty(Pk);
      if(kPresent) {
        kValue = O[Pk];
        callbackfn.call(T, kValue, k, O);
      }
      k += 1;
    }
    return undefined;
  };
}


// Avoid Logging To Console where not available. 
// http://perrymitchell.net/article/ie8_javascript_console/
(function() {
  var method;
  var noop = function() {};
  var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception',
                 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline',
                 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
  var length = methods.length;
  var console = (window.console = window.console || {});
  while(length--) {
    method = methods[length];
    // Only stub undefined methods.
    if(!console[method]) {
      console[method] = noop;
    }
  }
  
  // provides IE9 support 
  if (Function.prototype.bind && type(console, 'object') && type(console.log, 'object')) {
    methods.forEach(function(meth, idx) {
      console[method] = Function.prototype.call.bind(console[method], console);
    });
  }
}());

// indexOf
// http://perrymitchell.net/article/ie8_javascript_indexof_hasownproperty/
if(!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement /*, fromIndex */ ) {
    'use strict';
    if(this == null) {
      throw new TypeError();
    }
    var t = Object(this);
    var len = t.length >>> 0;
    if(len === 0) {
      return -1;
    }
    var n = 0;
    if(arguments.length > 1) {
      n = Number(arguments[1]);
      if(n !== n) { // shortcut for verifying if it's NaN
        n = 0;
      } else if(n !== 0 && n !== Infinity && n !== -Infinity) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }
    if(n >= len) {
      return -1;
    }
    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
    for(; k < len; k++) {
      if(k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  };
}

// Trim polyfill for ie7 and ie8
if (!String.prototype.trim) {
  (function() {
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function() {
      return this.replace(rtrim, '');
    };
  })();
}