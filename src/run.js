/*
 * Set up all the tags and pixels for VeGenie to work properly. 
 * 
 */

var store = require('./utils/store'),
    namespace = require('./settings').namespace,
    urlCheck = require('./utils/urls'),
    pages = require('./pages'),
    checkElement = require('./utils/checkElements'),
    addPixel = require('./utils/addPixel'),
    $ = require('./utils/jq'),
    pixelSrc = require('./utils/pixelSrc'),
    log = require('debug')('conversion:pixel'),
    type = require('./utils/type'),
    logOV = require('debug')('run:value'),
    logID = require('debug')('run:id'),
    logROS = require('debug')('run:ros'),
    logPP = require('debug')('run:product'),
    logB = require('debug')('run:basket'),
    criteria = require('./utils/criteria').criteria,
    settings = require('./settings'),
    PubSub = require('./pubsub-js'),
    masks = require('./utils/criteria').masks;


var ORDERVALUE = 'orderValue';
var ORDERID = 'orderId';
var IDLIST = 'idList';
var ITEMSTRING = 'itemString';

var idFromCompletePage = pages.id.fromCompletePage();
var valueFromCompletePage = pages.value.fromCompletePage();

// PIXELS

function createCompletePagePixel(data) {
  var config = settings.genie;
  var genieNexusSrc, nexusSrc,  genieSrc,
      orderValue = valueFromCompletePage ? getVal(config.orderValue) : getValue(ORDERVALUE) || config.orderValue['default'],
      orderId = idFromCompletePage ? getVal(config.orderId) : getValue(ORDERID) || (new Date()).getTime(),
      completionId = config.completionId, gdmConversionCode = config.gdmConversionCode,
      gdmSegmentId = config.gdmSegementId,
      items = getValue(ITEMSTRING) || null, // retrieve itemString generated on the cart page
      idList = getValue(IDLIST) || null,
      journeyCode = config.journeyCode, segmentIds = '',
      dbmSrc = config.dbm.src, dbmCat = config.dbm.cat.conversion || config.dbm.cat.ros;
  
  
  
//   if (type(config.segmentIds, 'array') && completionId) {
//     segmentIds = '&remove=' + config.segmentIds[0] + ',' + config.segmentIds[1];
//     genieNexusSrc = '//secure.adnxs.com/px?id=' + completionId + segmentIds + '&order_id=' +
//     orderId + '&value=' + orderValue + '&t=2';
//     addPixel(genieNexusSrc);
//     log('Genie App Nexus Completion Pixel added to complete page');
//   }
  
  
  if (completionId) {
    nexusSrc = '//secure.adnxs.com/px?id=' + completionId + '&seg=' + config.segmentIds[1] + '&order_id=' +
      orderId + '&value=' + orderValue + '&t=2';

    addPixel(nexusSrc);
    log('App Nexus Completion Pixel added to complete page');
  }
  
  
  if (journeyCode && journeyCode.length) {
    
    var params = {
      companyId: journeyCode,
      items: (items ? items + '|' : '') + 'BASKETVAL' + ':' + orderValue,
      orderId: orderId
    };
    
    genieSrc = pixelSrc.adgenie(params, true) ;
    log('adGenie Completion Pixel added to complete page');
    addPixel(genieSrc);
  }
  
  if (dbmSrc && dbmCat) {
    var dbmParams = {
      src: dbmSrc,
      cat: dbmCat,
      orderId: orderId,
      orderValue: orderValue
    };
    
    var dbmPixelSrc = pixelSrc.dbm.conversion(dbmParams);
    addPixel(dbmPixelSrc);
    log('Doubleclick Bid Manager Conversion Pixel added to complete page');
  }
  
  // remove zombie listeners once code has run.   
  PubSub.clearAllSubscriptions();
}


/**
 * 
 * PIXEL CREATION SECTION 
 * 
 * [:TODO] - All the pixel creation methods should require the same parameters
 */

/**
 * Creation of the ROS pixel
 * 
 * @param {object} config - object with the configuration of the site.
 */
function createROSPixel (config) {
  var srcIb, srcSecure;
  
  srcIb = pixelSrc.ros(config.segmentIds);
  srcSecure = pixelSrc.ros(config.segmentIds, true);
  
  addPixel(srcIb);
  addPixel(srcSecure);
    
  logROS('ROS Pixel added to the site.');
}

/**
 * 
 * [:TODO] - merge with createROSPixel if possible. Flag to diferenciate DBM or no.
 */
function createDbmROSPixel (config) {
  var params = {
    src: config.dbm.src,
    cat: config.dbm.cat.ros
  };
  
  srcDbm = pixelSrc.dbm.ros(params);
  
  
  addPixel(srcDbm);
    
  logROS('DBM ROS Pixel added to the site.');
}

/**
 * 
 * [:TODO] - what are we using this function for? can't be used inside createROSPixel??
 */
function rosPages(config) {
  if (config.ros) {
    logROS('Page qualifies for ROS');
    createROSPixel(config);
  }
  
  if( config.dbm.ros && config.dbm.cat.ros) {
    logROS('Page qualifies for Doubleclick Bid Manager ROS');
    createDbmROSPixel(config);
  }
  return false;
}


/**
 * Creation of the Product page pixel
 * 
 * @param {object} productPageObj - object with the configuration of the product page.
 */
function buildProductPagePixel (productPageObj) {
  // when default is provided we should fallback to it if not then 
  // don't place a pixel on this page.
  var noFallback = productPageObj['default'] ? false : true; // 
  
  var srcIb, srcSecure, genieSrc,
      
      productId = getVal(productPageObj, noFallback),
      config = settings.genie,
      journeyCode = config.journeyCode;
  
  if( !productId ) {
    logPP('No Default provided and product element not found on this page');
    rosPages(require('./settings').genie); // implement ROS if applicable
    return;
  }
  
  srcIb = pixelSrc.product(config.segmentIds);
  srcSecure = pixelSrc.product(config.segmentIds, true);
  
  addPixel(srcIb);
  addPixel(srcSecure);
  
  var params = {
      adgCompanyID: journeyCode,
      adgItem: productId
    };
  
  
  genieSrc = pixelSrc.adgenie(params, false) ;
  logPP('Genie Src is:', genieSrc);
  addPixel(genieSrc);
  logPP('Product Page Pixel added to the site.');
}

/**
 * Creation of the Basket page pixel
 * 
 * @param {object} idList - list of IDs of the products in the basket
 */
function buildBasketPagePixel (idList) {
  var journeyCode = settings.genie.journeyCode;
  if(!idList) { return; }
  var params = {
      adgCompanyID: journeyCode,
      adgBasketItems: idList
    };
  
  
  genieSrc = pixelSrc.adgenie(params, false) ;
  addPixel(genieSrc);
  logB('Basket pixel added added to the site.', genieSrc);
}


var subscribers = {
  value: function(msg, data) {checkForOrderValueSelector(data);},
  id: function(msg, data) {checkPageObject(data);},
  product: function(msg, data) {buildProductPagePixel(data);},
  basket: function(msg, data) {createBasketInformation(data);},
  complete: function(msg, data) {createCompletePagePixel(data);}
};

/**
 * LISTENERS
 */
var listeners = {
  value: PubSub.subscribe('page.value', subscribers.value),
  id: PubSub.subscribe('page.id', subscribers.id),
  product: PubSub.subscribe('page.product', subscribers.product),
  basket: PubSub.subscribe('page.basket', subscribers.basket),
  complete: PubSub.subscribe('page.complete', subscribers.complete)
};


module.exports = {
  start: function(config) {
    var complete, orderVal, basket, product;
    
    rosPages(config);
    // Are we on the order value page or orderIdPage?
    orderVal = pages.value.run();
    var orderId = pages.id.run();
    
    // Are we on the complete page?
    complete = pages.complete.run();
    
    // basket = basketPages(config);
    
    if (!complete) {
      basket = pages.basket.run();
    }
    
    if (!complete && !basket ) { product = pages.product.run(); }
    
  }
};

/**
 * 
 *[:TODO] Exported to .utils/CheckElements. Remove when approved.
 */
function regexReplacementFromElement( $el, regex, fallback, lastResort ) {
  regex = type(regex, 'regexp') ? regex : new RegExp('', 'g');
  return ($el.text() && $el.text().trim().replace(regex, '')) ||
      ($el.val() && $el.val().trim().replace(regex, '')) ||
      String( fallback || lastResort );
}


/**
 * 
 *[:TODO] Exported to .utils/CheckElements. Remove when approved.
 */
function getVal ( obj, noFallback ) {
  var $el = $(obj.selector),
      timestamp = (new Date()).getTime();
  
  if (!$el.length) { return noFallback ? '' : obj['default'] || timestamp; }
  
  var val = regexReplacementFromElement( $el, obj.regex, obj['default'], timestamp);
     
  return encodeURIComponent(val);
}


function createBasketInformation(config) {
 
  var $productIdEl = checkElement.check(config.selectors.productId),  // called synchronously
      $productPriceEl = checkElement.check(config.selectors.productPrice);  // called synchronously
  

  
  var itemString = createBasketString($productPriceEl, itemStringCallback);
  var idList = createBasketString($productIdEl, idListCallback);
  
  
  // TODO: This is called regardless of whether we have something to store or not. That is not good!
  setTimeout(function () {
    storeValue(itemString, ITEMSTRING);
    storeValue(idList, IDLIST);
  }, 0);
  
  buildBasketPagePixel(idList);
  
}

/**
  * Find the OrderValue from the page when this is the relevant page.
  */
function checkForOrderValueSelector(orderValueObject) {
  var dynamically = (orderValueObject.updates && orderValueObject.urls.length) ? ' - DYNAMAICALLY': '';
  var check = (orderValueObject.updates && orderValueObject.urls.length) ? checkElement.checkUpdates : checkElement.check;

  logOV('Checking For Order Value' + dynamically);
  
  check( orderValueObject.selector, function($el) {
    var val = masks[orderValueObject.mask || 'doNothing'](regexReplacementFromElement( $el, orderValueObject.regex, orderValueObject['default'] ));
    logOV('Order Value element found'+ dynamically + ' : ' + val);
    storeValue(val, ORDERVALUE);
  });
}

function checkPageObject(obj) {
  
  logID('Checking For order Id');
  
  checkElement.check( obj.selector, function($el) {
    
    var val = masks[obj.mask || 'doNothing'](regexReplacementFromElement( $el, obj.regex, obj['default'] ));
    logID( 'Order ID found ' + val );
    storeValue(val, ORDERID);
  });
}

// If order value should be called from the complete page - then run this instead. 
function orderValueOnCompletePage(orderValueObject) {}



/**
  * Create a list of product names from an element. Blue%20Bag|Red%20Shoes|Green%20Coat
  *
  * @param {element} $el - jQuery selector for an element of the domain (basket item)
  * @param {int} len - length of the expression
  */
function idListCallback($el, len) {
  var idList = '';
  $el.each(function (idx, el) {
    var val = checkElement.getValOrText($(el));
   
   /*Patch to use the Regex. If new version of getvalortext we need the object here, like at the top*/
   //var val = checkElement.getValOrText($(el),config.basketPages);
   
    // run through basket regex here. Using `regexReplacementFromElement`
    val = encodeURIComponent(val);
    idList += val + (idx < (len - 1) ? '|' : '');
  });
  return idList;
}



/**
  * Item string. generate a string of product prices that looks like PROD1:7.99|PROD2:4.99|PROD3:12.99
  *
  * @param {element} $el - jQuery selector for an element of the domain (basket item)
  * @param {int} len - length of the expression
  */
function itemStringCallback($el, len) {
  var itemString = '';
  $el.each(function (idx, el) {
   
    var val = checkElement.getValOrText($(el));
    val = masks.currency(val);
    itemString += 'PROD' + (idx + 1) + ':' + val + (idx < (len - 1) ? '|' : '');
  });
  return itemString;
}



/**
  * Creation of a string from the basket page usind the callback function.
  *
  * @param {element} $el - jQuery selector for an element of the domain (basket item)
  * @param {function} fn - function to create the string required.
  * [:TODO] Regex check needs to be perfomed
  */
function createBasketString($el, fn) {
  if(!$el || !$el.length || !fn ) {return '';}
  
  var len = $el.length;
  if (!len) {return '';}
  return fn($el, len); // return the value generated from the callback function  
}



/**
 * 
 * OTHER FUNCTIONS 
 * 
 */


/**
 * Store and retrieve values from localStorage. using file ./utils/store.js
 * 
 * @param {int/str} val - value to store
 * @param {str} valName - name of the value to store
 * 
 * [:TODO] the correct order is valName, val.
 * [:TODO] Names should be changed to -> get/setValStorage()
 */
function storeValue(val, valName) {
  logOV('Storing ' + valName + ' as ' + val);
  store.set(namespace+valName, val);
}

function getValue(valName) {
  logOV('Obtaining from storage ' + valName);
  return store.get(namespace + valName);
}
