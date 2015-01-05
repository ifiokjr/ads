/*
 * Set up all the tags and pixels for VeGenie to work properly. 
 */

var store = require('store'),
    namespace = require('./settings').namespace,
    urlCheck = require('./utils/urls'),
    checkElement = require('./utils/checkElements'),
    addPixel = require('./utils/addPixel'),
    $ = window.VEjQuery,
    log = require('./utils/log'),
    logOV = require('./utils/log');


var ORDERVALUE = 'orderValue';

// Criteria for the dynamic identifiers of which page is a complete page.
var criteria = {
  
  contains: function($el, value) {
    return $el.text().indexOf(String(value)) !== -1;
  },
  
  equal: function($el, value) {
    return $el.text() === String(value);
  },
  
  not: function($el, value) {
    return $el.text().indexOf(String(value)) === -1;
  }
  
};

var masks = {
  
  number: function( str ) {
    str = String(str);
    return str.replace(/[^0-9]/g, '');
  },
  
  alphanumeric: function( str ) {
    // TODO: implement somthings aweosme. [A-Z0-9]
  }
};



function createCompletePagePixel(config) {
  var src,
      orderValue = getOrderValue() || config.orderValue.default,
      orderId = getOrderId(config.orderId) || (new Date()).getTime(),
      completionId = config.completionId;
  src = 'https://secure.adnxs.com/px?id=' + completionId + '&order_id=' +
    orderId + '&value=' + orderValue + '&t=2';
  
  addPixel(src);
  log('Pixel Added to complete page');
}

  
function completePage(config) {
  var match = false,
      dynamicId = config.completePage.dynamicIdentifier;
  
  // dynamically check for checkout page
  if (dynamicId.selector.length) {
    checkElement.check(selector, function($el) {
      if (dynamicId.criteria.length && dynamicId.value.length &&
          criteria[dynamicId.criteria]($el, dynamicId.value)) {
        createCompletePagePixel(config);
      }
    });
  }
  
  $.each(config.completePage.urls, function(index, url) {
    if(urlCheck.test(url, config.completePage.params)) {
      match = true;
    }
  });
  
  if ( match ) { // we are on a complete page
    createCompletePagePixel(config);
  }
}

// OrderValue Page grab order Value and add to local storage

function orderValuePage(config) {
  
  var match = false,
      page = config.orderValue.page;
  $.each( page.urls, function(index, url) {
    if(urlCheck.test(url, config.completePage.params)) {
      match = true;
    }
  });
  
  if( match ) {
    logOV('We are on the Order Value Page');
    checkForOrderValueSelector(config.orderValue);
  }
}


module.exports = {
  start: function(config) {
    
    // Are we on the complete page?
    completePage(config);
    
    // Are we on the order value page?
    orderValuePage(config);
  }
};


function getOrderId (orderIdObject) {
  var $el = $(orderIdObject.selector);
  var val = $el.text().replace(orderIdObject.regex, '') || $el.val().replace(orderIdObject.regex, '');
  return encodeURIComponent(val);
}


function checkForOrderValueSelector(orderValueObject) {
  logOV('Checking For Order Value');
  
  checkElement.check( orderValueObject.selector, function($el) {
    logOV('Order Value element found');
    var val = $el.val().replace(orderValueObject.regex, '') ||
        $el.text().replace(orderValueObject.regex, '') ||
        String(orderValueObject.default);
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