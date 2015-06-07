'use strict';
/**
 * Module for including logging statements to the console.
 */

var nestedNoop = function() {
  return function () {};
};



/**
 * Exports debugVeAds object if it exists (has been injected into the DOM via a plugin);
 *
 * @type {[type]}
 */
module.exports = window.debugVeAds || nestedNoop;
