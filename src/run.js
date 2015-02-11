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
    logROS = require('debug')('run:ros'),
    logPP = require('debug')('run:product'),
    criteria = require('./utils/criteria').criteria,
    settings = require('./settings'),
    PubSub = require('pubsub-js'),
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
      journeyCode = config.journeyCode, segmentIds = '';
  
  
  
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
  
  // remove zombie listeners once code has run.   
  PubSub.clearAllSubscriptions();
}


// Add the ROS to the site when not on completion or product page. 
function createROSPixel (config) {
  var srcIb, srcSecure;
  
  srcIb = pixelSrc.ros(config.segmentIds);
  srcSecure = pixelSrc.ros(config.segmentIds, true);
  
  addPixel(srcIb);
  addPixel(srcSecure);
    
  logROS('ROS Pixel added to the site.');
}

// Still to be implemented

function buildProductPagePixel (productPageObj) {
  // when default is provided we should fallback to it if not then 
  // don't place a pixel on this page.
  var noFallback = productPageObj['default'] ? false : true; // 
  
  var srcIb, srcSecure, genieSrc,
      
      productId = getVal(productPageObj, noFallback),
      config = settings.genie,
      journeyCode = config.journeyCode;
  
  if( !productId ) { return logPP('No Default provided and product element not found on this page'); }
  
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


function buildBasketPagePixel (idList) {
  var journeyCode = settings.genie.journeyCode;
  if(!idList) { return; }
  var params = {
      adgCompanyID: journeyCode,
      adgBasketItems: idList
    };
  
  
  genieSrc = pixelSrc.adgenie(params, false) ;
  addPixel(genieSrc);
  logPP('Basket pixel added added to the site.', genieSrc);
}


var subscribers = {
  value: function(msg, data) {checkForOrderValueSelector(data);},
  id: function(msg, data) {checkPageObject(data);},
  product: function(msg, data) {buildProductPagePixel(data);},
  basket: function(msg, data) {createBasketInformation(data);},
  complete: function(msg, data) {createCompletePagePixel(data);}
};

// LISTENERS
var listeners = {
  value: PubSub.subscribe('page.value', subscribers.value),
  id: PubSub.subscribe('page.id', subscribers.id),
  product: PubSub.subscribe('page.product', subscribers.product),
  basket: PubSub.subscribe('page.basket', subscribers.basket),
  complete: PubSub.subscribe('page.complete', subscribers.complete)
};





function rosPages(config) {
  if (!config.ros) {return false;}
  logROS('Page qualifies for ROS');
  createROSPixel(config);
  
}




module.exports = {
  start: function(config) {
    var complete, orderVal, basket, product;
    
    // Are we on the order value page or orderIdPage?
    orderVal = pages.value.run();
    var orderId = pages.id.run();
    
    // Are we on the complete page?
    complete = pages.complete.run();
    
    // basket = basketPages(config);
    
    if (!complete) { basket = pages.basket.run(); }
    
    if (!complete && !basket ) { product = pages.product.run(); }
    
    if ( !complete && !basket && !product ) { rosPages(config); }
  }
};


function regexReplacementFromElement( $el, regex, fallback, lastResort ) {
  regex = type(regex, 'regexp') ? regex : new RegExp('', 'g');
  return ($el.text() && $el.text().trim().replace(regex, '')) ||
      ($el.val() && $el.val().trim().replace(regex, '')) ||
      String( fallback || lastResort );
}



/*
 * Obtain the falue from the current page if this is the relevant page.
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
  

  
  var itemString = createItemString($productPriceEl);
  var idList = createIdList($productIdEl);
  
  
  // TODO: This is called regardless of whether we have something to store or not. That is not good!
  setTimeout(function () {
    storeValue(itemString, ITEMSTRING);
    storeValue(idList, IDLIST);
  }, 0);
  
  buildBasketPagePixel(idList);
  
}

/*
 * Find the OrderValue from the page when this is the relevant page.
 */
function checkForOrderValueSelector(orderValueObject) {
  
  logOV('Checking For Order Value');
  
  checkElement.check( orderValueObject.selector, function($el) {
    var val = masks[orderValueObject.mask || 'doNothing'](regexReplacementFromElement( $el, orderValueObject.regex, orderValueObject ));
    logOV('Order Value element found', val);
    storeValue(val, ORDERVALUE);
  });
}

function checkPageObject(obj) {
  
  logOV('Checking For order Id');
  
  checkElement.check( obj.selector, function($el) {
    
    var val = masks[obj.mask || 'doNothing'](regexReplacementFromElement( $el, obj.regex, obj ));
    logOV('Order Id element found', val);
    storeValue(val, ORDERID);
  });
}


function storeValue(val, valName) {
  logOV('Storing ' + valName + ' as ' + val);
  store.set(namespace+valName, val);
}


// If order value should be called from the complete page - then run this instead. 
function orderValueOnCompletePage(orderValueObject) {}

function getValue(valName) {
  logOV('Obtaining from storage ' + valName);
  return store.get(namespace + valName);
}



// Basket page stuff

function createItemString($el) {
  if(!$el || !$el.length) {return '';}
  var itemString = '';
  var len = $el.length;
  if (!len) {return '';}
  $el.each(function (idx, el) {
    var val = checkElement.getValOrText($(el));
    val = masks.currency(val);
    itemString += 'PROD' + (idx + 1) + ':' + val + (idx < (len - 1) ? '|' : '');
  });
  
  return itemString;
}

function createIdList($el) {
  if(!$el || !$el.length) {return '';}
  var idList = '';
  var len = $el.length;
  if (!len) {return '';}
  $el.each(function (idx, el) {
    var val = checkElement.getValOrText($(el));
    val = encodeURIComponent(val);
    idList += val + (idx < (len - 1) ? '|' : '');
  });
  
  return idList;
}
