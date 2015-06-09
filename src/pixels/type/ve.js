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
 *   conversion: [orderVal, orderId, idList, itemString],
 *   basket: [idList, itemString],
 *   category: [idList]
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
    needs: ['orderVal', 'orderId', 'idList', 'itemString'],
    produces: [conversion, conversionItems, conversionNew, conversionItemsNew]
  },

  basket: {
    needs: ['idList', 'itemString'],
    produces: [basket, basketNew]
  },

  category: {
    needs: ['idList'],
    produces: [category, categoryNew]
  }
};



function product(data, config, base) {
  return (base || '//adverts.adgenie.co.uk/genieTracker.php?adgCompanyID=') +
         config.journeyCode + '&adgItem=' + data.productId;
}

function productNew( data, config ) {
  return product( data, config, '//veads.veinteractive.com/genieTracker.php?adgCompanyID=' );
}



function conversion( data, config, base ) {
  var itemString = generateItemString( data.itemString );

  return (base || '//adverts.adgenie.co.uk/conversion.php?companyId=') +
         config.journeyCode + '&items=' + (itemString ? itemString + '|' : '') +
         'BASKETVAL:' + data.orderVal + '&orderId=' + data.orderId;
}

function conversionNew( data, config ) {
  return conversion( data, config, '//veads.veinteractive.com/conversion.php?companyId=' );
}



function conversionItems( data, config, base ) {
  var purchasedItems = generateIdList( data.idList );

  return (base || '//adverts.adgenie.co.uk/genieTracker.php?adgCompanyID=') +
         config.journeyCode + '&adgPurchasedItems=' + purchasedItems;
}

function conversionItemsNew( data, config ) {
  return conversionItems( data, config, '//veads.veinteractive.com/genieTracker.php?adgCompanyID=');
}





function category( data, config, base ) {
  return (base || '//adverts.adgenie.co.uk/genieTracker.php?adgCompanyID=') +
         config.journeyCode + '&adgItem=' + generateIdList( data.idList );
}

function categoryNew( data, config, base ) {
  return category( data, config, '//veads.veinteractive.com/genieTracker.php?adgCompanyID=');
}




function basket( data, config, base ) {
  return (base || '//adverts.adgenie.co.uk/genieTracker.php?adgCompanyID=') +
         config.journeyCode + '&adgBasketItems=' + generateIdList( data.idList );
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
  var idList = '';
  list = list || [];

  $.each(list, function( index, value ) {
    value = encodeURIComponent( value ); // Usable as a url.
    idList += value + (index < (list.length - 1) ? '|' : '');
  });

  return idList;
}


/**
 * Takes a list and returns the itemString with prices as a string.
 * @param  {Array} list - The array of values to transform
 * @return {String}     - The formatted string as outlined in the specs
 */

function generateItemString( list ) {
  var itemString = '';
  list = list || [];

  $.each(list, function( index, value ) {
    value = encodeURIComponent( value ); // Usable as a url.
    itemString += 'PROD' + (index + 1) + ':' + value +
                  (index < (list.length - 1) ? '|' : '');
  });

  return itemString;
}
