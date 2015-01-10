/*
 * Set up all the tags and pixels for VeGenie to work properly. 
 * 
 */

var store = require('./utils/store'),
    namespace = require('./settings').namespace,
    urlCheck = require('./utils/urls'),
    checkElement = require('./utils/checkElements'),
    addPixel = require('./utils/addPixel'),
    $ = window.VEjQuery,
    pixelSrc = require('./utils/pixelSrc'),
    log = require('./utils/log'),
    type = require('./utils/type'),
    logOV = require('./utils/log');


var ORDERVALUE = 'orderValue';

// Criteria for the dynamic identifiers of which page is a complete page.
var criteria = require('./utils/criteria');

var masks = {
  
  number: function( str ) {
    str = String(str);
    return str.replace(/[^0-9]/g, '');
  },
  
  alphanumeric: function( str ) {
    // TODO: implement somthings aweosme. [A-Z0-9]
  }
};


// PIXELS

function createCompletePagePixel(config) {
  var nexusSrc, genieSrc,
      orderValue = getOrderValue() || config.orderValue['default'],
      orderId = getOrderId(config.orderId) || (new Date()).getTime(),
      completionId = config.completionId,
      items, // retrieve itemString generated on the cart page
      journeyCode = config.journeyCode, segmentIds = '';
  
  if (type(config.segmentIds, 'array')) {
    segmentIds = '&remove=' + config.segmentIds[0] + ',' + config.segmentIds[1];
  }
  nexusSrc = '//secure.adnxs.com/px?id=' + completionId + segmentIds + '&order_id=' +
    orderId + '&value=' + orderValue + '&t=2';
  
  addPixel(nexusSrc);
  log('AppNexus Pixel Added to complete page');
  
  if (journeyCode && journeyCode.length) {
    
    var params = {
      companyId: journeyCode,
      items: (items || 'BASKETVAL') + ':' + orderValue,
      orderId: orderId
    };
    
    genieSrc = pixelSrc.adgenie(params, true) ;
    addPixel(genieSrc);
  }
}


// Add the ROS to the site when not on completion or product page. 
function createROSPixel (config) {
  var srcIb, srcSecure;
  
  srcIb = pixelSrc.ros(config.segmentIds);
  srcSecure = pixelSrc.ros(config.segmentIds, true);
  
  addPixel(srcIb);
  addPixel(srcSecure);
    
  log('ROS Pixel added to the site.');
}

// Still to be implemented
function buildProductPagePixel (config) {
  
}


// Utility function for checking the current page. 
function checkCurrentPage (urls, params) {
  var match = false;
  $.each(urls, function(index, url) {
    if(urlCheck.test(url, params)) {
      match = true;
    }
  });
  return match;
}

function completePage(config) {
  var match = false,
      dynamicId = config.completePage.dynamicIdentifier;
  
  // dynamically check for checkout page
  if (dynamicId.selector.length) {
    checkElement.checkUpdates(selector, function($el, newVal) {
      if (dynamicId.criteria.length && dynamicId.value.length &&
          criteria[dynamicId.criteria]($el, dynamicId.value)) {
        createCompletePagePixel(config);
        return true;
      }
    });
  }
  
  match = checkCurrentPage(config.completePage.urls, config.completePage.params);
  
  if ( match ) { // we are on a complete page
    createCompletePagePixel(config);
  }
  return match;
}

// OrderValue Page grab order Value and add to local storage

function orderValuePage(config) {
  
  var match = false,
      page = config.orderValue.page;
  
  match = checkCurrentPage(page.urls, page.params);
  
  if( match ) {
    logOV('We are on an Order Value Page');
    checkForOrderValueSelector(config.orderValue);
  }
  return match;
}


function rosPages(config) {
  if (!config.ros) {return false;}
  createROSPixel(config);
  
}


function basketPages(config) {
  var match = false,
      page = config.basketPages.page;
  
  match = checkCurrentPage(page.urls, page.params);
  
  if( match ) {
    logOV('We are on a Basket Page');
    createBasketInformation(config.basketPages);
  }
  return match;
}


function productPages(config) {
  var match = false,
      page = config.productPages.page;
  
  match = checkCurrentPage( page.urls, page.params );
  
  if( match ) {
    logOV('We are on a Product Page');
    buildProductPagePixel( config.productPages );
  }
  
  return match;
}


module.exports = {
  start: function(config) {
    var complete, orderVal, basket, product;
    
    // Are we on the order value page?
    orderVal = orderValuePage(config);
    
    // Are we on the complete page?
    complete = completePage(config);
    
    // basket = basketPages(config);
    
    // product = productPages(config);
    
    if ( !complete && !basket && !product ) { rosPages(config); }
  }
};



function regexReplacementFromElement( $el, regex, fallback, lastResort ) {
  regex = regex || new RegExp('', 'g');
  return ($el.text() && $el.text().replace(regex, '')) ||
      ($el.val() && $el.val().replace(regex, '')) ||
      String( fallback || lastResort );
}


/*
 * Find the orderId from the page if this is the relevant page.
 */
function getOrderId (orderIdObject, fallback) {
  var $el = $(orderIdObject.selector),
      timestamp = (new Date()).getTime();
  
  if (!$el.length) { return orderIdObject['default'] || timestamp; }
  
  var val = regexReplacementFromElement( $el, orderIdObject.regex, orderIdObject, timestamp);
     
  return encodeURIComponent(val);
}


// TODO: Still to be implemented
function createBasketInformation(config) {
  
}

/*
 * Find the OrderValue from the page when this is the relevant page.
 */
function checkForOrderValueSelector(orderValueObject) {
  logOV('Checking For Order Value');
  
  checkElement.check( orderValueObject.selector, function($el) {
    logOV('Order Value element found');
    var val = regexReplacementFromElement( $el, orderValueObject.regex, orderValueObject );
    
    storeOrderValue(val);
  });
}


function storeOrderValue(val) {
  logOV('Storing Order Value');
  store.set(namespace+ORDERVALUE, val);
}



function getOrderValue() {
  logOV('Obtaining Order Value');
  return store.get(namespace + ORDERVALUE);
}