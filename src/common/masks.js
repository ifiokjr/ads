'use strict';

/**
 * @module `common/masks`
 *
 * Allows for default regex to be applied to data before storage.
 */

var type = require('./utils').type;

// Taken from http://stackoverflow.com/questions/25910808/javascript-regex-currency-symbol-in-a-string#27175364
var ScRe = /[\$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6]/,

masks = {

  number: function( str ) {
    var num = String(str).match(/([\d]{3,25})/);
    return type(num, 'array') ? num[1] : '';
  },


  alphanumeric: function( str ) {
    var alpha = String(str).match(/([\dA-Za-z]{4,25})/);
    return type(alpha, 'array') ? alpha[1]: '';
  },

  // obtain currency value.
  currency: function( str ) {
    return String( str ).replace(/[^0-9\.,]/g, '');
  },


  // spec for returning a currency symbol
  symbol: function( str ) {
    var symbol = String( str ).match(ScRe);
    return type(symbol, 'array') ? symbol[0] : '';
  },


  nothing: function( str ) {
    return String( str );
  }
};


/**
 * @exports masks
 */

module.exports = masks;
