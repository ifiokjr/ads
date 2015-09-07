'use strict';

/**
 * @module
 *
 * `ve` type pixels.
 * Provides pixels for: product, conversion, basket and category pages.
 *
 * requires: `journeyCode`
 *
 * Simply exports an object that provides all the configuration so that
 * pixels can easily be extended and also generated
 *
 * - **ve**: pixel for retargeting it has pixels for pages:
 *
 * Data Required
 * {
 *   product: [productId],
 *   conversion: [orderVal, orderId, productList, priceList],
 *   basket: [productList, priceList],
 *   category: [productList]
 * }
 |   hardcoded: journeyCode
 *
 */

var $ = require( '../../common/jq' );



/**
 * src String Generators, pattern of (data, config)
 */

module.exports = {

  product: {
    needs: ['productId'],
    produces: [product, productNew]
  },

  conversion: {
    needs: ['orderVal', 'orderId', 'productList', 'priceList'],
    produces: [conversion, conversionItems]
  },

  basket: {
    needs: ['productList', 'priceList'],
    produces: [basket, basketNew]
  },

  category: {
    needs: ['productList'],
    produces: [category, categoryNew]
  }
};



function product(data, config, base) {
  return (base || '//adverts.adgenie.co.uk/genieTracker.php?adgCompanyID=') +
         config.journeyCode + '&adgItem=' + encodeURIComponent(data.productId);
}

function productNew( data, config ) {
  return product( data, config, '//veads.veinteractive.com/genieTracker.php?adgCompanyID=' );
}


function conversion( data, config ) {
  var priceList = generateItemString( data.priceList );

  return '//veads.veinteractive.com/conversion.php?companyId=' +
         config.journeyCode + '&items=' + (priceList ? priceList + '|' : '') +
         'BASKETVAL:' + data.orderVal + '&orderId=' + data.orderId;
}


function conversionItems( data, config ) {
  var purchasedItems = generateIdList( data.productList );

  return '//veads.veinteractive.com/genieTracker.php?adgCompanyID=' +
         config.journeyCode + '&adgPurchasedItems=' + purchasedItems;
}


function category( data, config, base ) {
  return (base || '//adverts.adgenie.co.uk/genieTracker.php?adgCompanyID=') +
         config.journeyCode + '&adgItem=' + generateIdList( data.productList );
}

function categoryNew( data, config, base ) {
  return category( data, config, '//veads.veinteractive.com/genieTracker.php?adgCompanyID=');
}




function basket( data, config, base ) {
  return (base || '//adverts.adgenie.co.uk/genieTracker.php?adgCompanyID=') +
         config.journeyCode + '&adgBasketItems=' + generateIdList( data.productList );
}

function basketNew( data, config ) {
  return basket(data, config, '//veads.veinteractive.com/genieTracker.php?adgCompanyID=');
}



/**
 * Takes a list and returns the ID List string
 * @param  {Array} list - The array of values to transform
 * @return {String}     - The formatted string as outlined in the specs
 */

function generateIdList( list ) {
  var productList = '';
  list = list || [];

  $.each(list, function( index, value ) {
    value = encodeURIComponent( value ); // Usable as a url.
    productList += value + (index < (list.length - 1) ? '|' : '');
  });

  return productList;
}


/**
 * Takes a list and returns the priceList with prices as a string.
 * @param  {Array} list - The array of values to transform
 * @return {String}     - The formatted string as outlined in the specs
 */

function generateItemString( list ) {
  var priceList = '';
  list = list || [];

  $.each(list, function( index, value ) {
    value = encodeURIComponent( value ); // Usable as a url.
    priceList += 'PROD' + (index + 1) + ':' + value +
                  (index < (list.length - 1) ? '|' : '');
  });

  return priceList;
}
