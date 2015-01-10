/**
 * Created with GDM.
 * User: ifiokjr
 * Date: 2015-01-06
 * Time: 09:47 AM
 * 
 * This file checks which methods to use for local storage. 
 */
var store, storage,
    type = require('./type'),
    noop = function() {},
    noStorage, simpleStorage,
    method = 'localStorage';

noStorage = {
  set: noop,
  get: noop,
  remove: noop,
  clear: noop,
  SUPPORT: 'none'
};

simpleStorage = {
  set: function( key, val ) {
    return window[method].setItem( key, val );
  },
  
  get: function ( key ) {
    return window[method].getItem( key );
  },
  
  remove: function( key ) {
    return window[method].removeItem( key );
  },
  
  clear: function( ) {
    return window[method].clear();
  },
  
  SUPPORT: 'simple'
};

var STORAGE_SUPPORTED; // = supportStorage(method);

function supportStorage(method) {
  var test = 'testStorage';
  try {
    window[method].setItem(test, test);
    window[method].removeItem(test);
    return true;
  } catch(e) {
    return false;
  }
}



if(type(JSON.parse, 'function') && type(JSON.stringify, 'function')) {
  store = require('store');
  storage = store.enabled ? store : noStorage;
} else {
  storage = (STORAGE_SUPPORTED || (STORAGE_SUPPORTED = supportStorage(method))) ? simpleStorage : noStorage;
}


module.exports = storage;