'use strict';

/**
 * Module for including logging statements to the console.
 */

var nestedNoop = function() {
  return function () {};
};


if ( window.debugVeAds && window.debugVeAds.enable ) {
  window.debugVeAds.enable('*');
}

/**
 * Exports debugVeAds object if it exists (has been injected into the DOM via a plugin);
 *
 * @type {[type]}
 */

module.exports = window.debugVeAds || nestedNoop;
