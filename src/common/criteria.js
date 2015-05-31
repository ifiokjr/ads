var type = require('./utils').type;

module.exports = {

  contains: function( str, value ) {
    str = String(str.toLowerCase());
    return str.indexOf(String(value).toLowerCase()) > -1;
  },

  containsCaseSensitive: function( str, value ) {
    str = String( str );
    return str.indexOf( String(value) ) > -1;
  },

  equal: function( str, value ) {
    return String( str.toLowerCase() ) === String( value.toLowerCase() );
  },

  not: function( str, value ) {
    return String( str.toLowerCase() ) !== String( value.toLowerCase() );
  },

  notContains: function( str, value ) {
    return String( str.toLowerCase() )
    .indexOf( String(value.toLowerCase()) ) === -1;
  },

  // Always returns true
  always: function ( ) {
    return true;
  }

};
