var PubSub = require('./pubsub-js'),
  checkElement = require('./utils/checkElements'),
  type = require('./utils/type'),
  urlCheck = require('./utils/urls'),
  logger = require('debug'),
  $ = require('./utils/jq'),
  criteria = require('./utils/criteria').criteria,
  settings = require('./settings').genie,
  pageObject = {
    'productPages': {
      namespace: 'product', name: 'productPages'
    },
    'basketPages': {
      namespace: 'basket', name: 'basketPages'
    },
    'orderValue': {
      namespace: 'value', name: 'orderValue'
    },
    'orderId': {
      namespace: 'id', name: 'orderId'
    },
    'completePage': {
      namespace: 'complete', name: 'completePage'
    }
  };


// takes in the page settings from the veads object
function Page( config, settings ) {
  this.urlMatch = false;
  var page = settings.page || {}; // for older versions which don't have the page obj
  this.params = page.params || {};
  this.urls = page.urls || [];
  this.dynamicId = settings.dynamicIdentifier || {};
  
  this.namespace = config.namespace;
  this.name = config.name;
  this.setUpLogger();
}

Page.prototype.check = function( ) {
  var match = false;
  var self = this;
  this.log('checking through urls');
  $.each( this.urls, function(index, url) {
    var params = self.params;
    if ( type(url, 'object') && url.params && Object.size(url.params) ) {
      params = $.extend( {}, params, urls.params );
    }
    
    if ( urlCheck.test(url, params) ) {
      match = true;
      self.log(self.namespace, 'matches with url', url, 'and params', params);
    }
  });
  
  this.UrlMatch = match;
  return match;
};


Page.prototype.setUpLogger = function() {
  this.log = logger('page:' + this.namespace);
};


// dynamically check for  page
Page.prototype.dynamicIdentifier = function () {
  var dynamicId = this.dynamicId,
      self = this;
  if ( this.dynamicIdentifierExists() && this.UrlMatch ) {
    this.log('checking for dynamic identifier');
    checkElement.checkUpdates(dynamicId.selector, function($el, newVal) {
      
      if ( criteria[dynamicId.criteria || 'yesPlease'](newVal, dynamicId.value) ) {
        self.log('dynamic identifier test passed now ready to act');
        PubSub.publishSync('page.' + self.namespace, settings[self.name]);
        return true;
      }
    });
  }
};


Page.prototype.run = function() {
  if ( this.check() ) {
    if( this.dynamicIdentifierExists() ) {
      this.dynamicIdentifier();
      return false; // page hasn't been identified yet. 
    } else {
      this.log('url found and no dynamic identifier running page action');
      PubSub.publishSync('page.' + this.namespace, settings[this.name]);
      return true;
    }
  }
};


// returns boolean whether we need to dynamically identify the page
Page.prototype.dynamicIdentifierExists = function ( ) {
  
  return (Object.size(this.dynamicId) && this.dynamicId.selector && this.dynamicId.selector.length);
};


Page.prototype.fromCompletePage = function () {
  if (this.urls.length) {
    return false;
  }
  return true;
};


module.exports = {
  product: new Page(pageObject.productPages, settings.productPages),
  basket: new Page(pageObject.basketPages, settings.basketPages),
  value: new Page(pageObject.orderValue, settings.orderValue),
  id: new Page(pageObject.orderId, settings.orderId  ),
  complete: new Page(pageObject.completePage, settings.completePage)
};