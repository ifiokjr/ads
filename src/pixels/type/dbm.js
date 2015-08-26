'use strict';

/**
 * @module
 *
 * Provides DBM pixels for [ros, conversion, custom, product, custom, basket ]
 *
 */

var log = require( '../../common/debug' )('ve:pixels:type:dbm');


/**
 * @description Pixel automation configuration object
 *
 * ```
 * [Page Type]: {
 *   needs: [dataTypes],
 *   produces: [function(s)]
 * }
 * ```
 */
module.exports = {

  conversion: {
    needs: ['orderVal', 'orderId', 'productList'],
    produces: [conversion]
  },

  ros: {
    needs: [],
    produces: [generic('ROS')]
  },

  product: {
    needs: [],
    produces: [generic('Product')]
  },

  basket: {
    needs: [],
    produces: [generic('Basket')]
  },

  custom: {
    needs: [],
    produces: [generic('Custom')]
  },
};


function ros( data, config ) {
  var random = (Math.random() + '') * 10000000000000;
  return 'https://ad.doubleclick.net/ddm/activity/src=' + config.src +
  ';type=invmedia;cat=' + config.catROS + ';ord=' + random;
}

function conversion( data, config ) {
  // First check that this pixel needs to be placed on the conversion page
  if (!config.catConversion) {
    log('No catConversion provided for Conversion page');
    return;
  }
  var qty = data.productList && data.productList.length;
  return 'https://ad.doubleclick.net/ddm/activity/src=' + config.src +
  ';type=sales;cat=' + config.catConversion + ';qty=' + (data.productList.length || 1) +
  ';cost=' + data.orderVal + ';ord=' + data.orderId + '?';
}

/**
 * Set up one function that can work for all the generic pages.
 * Custom, Product, ROS, Basket produce an almost identical pixel. We don't
 * need to be setting up anything too complex.
 *
 * @param  {String} type - The type of page that needs to be produced.
 * @return {Function}    - Function produced within the closure takes in
 *                         the type and uses it with data and config
 */
function generic(type) {
  var cat = 'cat' + type; // prepend page type

  return function(data, config) {
    // First Check that the config for this page type has been provided
    if (!config[cat]) {
      log('No property provided for page type: ' + type);
      return; // We don't want to do anything
    }

    var random = (Math.random() + '') * 10000000000000;
    return 'https://ad.doubleclick.net/ddm/activity/src=' + config.src +
    ';type=invmedia;cat=' + config[cat] + ';ord=' + random;
  };
}
