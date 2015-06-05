'use strict';

/**
 * @module `common/contains`
 */

var type = require('./utils').type,
    criteria;


/**
 * Exports contains object
 */

module.exports = criteria = {


  /**
   * Always returns true. A check that will always match.
   *
   * @return {Boolean} Always true.
   */

  always: function ( ) {
    return true;
  },


  /**
   * Checks that the passed string is equal to the passed value.
   *
   * @param  {String} str   - passed string
   * @param  {String} value - value to test against
   * @param  {Boolean} caseSensitive - don't ignore the case if true
   *
   * @return {Boolean}
   */

  equal: function( str, value, caseSensitive ) {
    str = String( str );
    value = String( value );

    if ( !caseSensitive ) {
      str = str.toLowerCase( );
      value = value.toLowerCase( );
    }

    return str === value;
  },

  /**
   * Checks that the passed string is NOT equal to the passed value.
   *
   * @param  {String} str   - passed string
   * @param  {String} value - value to test against
   * @param  {Boolean} caseSensitive - don't ignore the case if true
   *
   * @return {Boolean}
   */

  notEqual: function( str, value, caseSensitive ) {
    return !criteria.equal( str, value, caseSensitive );
  },



  /**
   * Checks that the passed string is within the passed value.
   *
   * @param  {String} str   - passed string
   * @param  {String} value - value to test against
   * @param  {Boolean} caseSensitive - don't ignore the case if true
   *
   * @return {Boolean}
   */

  contains: function( str, value, caseSensitive ) {
    str = String( str );
    value = String( value );

    if ( !caseSensitive ) {
      str = str.toLowerCase( );
      value = value.toLowerCase( );
    }

    return value.indexOf( str ) > -1;
  },


  /**
   * Checks that the passed string is **NOT** within the passed value.
   *
   * @param  {String} str   - passed string
   * @param  {String} value - value to test against
   * @param  {Boolean} caseSensitive - don't ignore the case if true
   *
   * @return {Boolean}
   */

  notContains: function( str, value, caseSensitive ) {
    return !criteria.contains( str, value, caseSensitive );
  },

};
