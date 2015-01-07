(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Load Polyfills
require('./utils/polyfills');

var settings = require('./settings'),
    gdmHandler = require('./gdmhandler'),
    genieHandler = require('./geniehandler');
console.info('entering the application');
// Firstly lets run the gdm handler. 
gdmHandler.start(settings.gdm);


// Now we run the Genie specific tags. 
genieHandler.start(settings.genie);

},{"./gdmhandler":4,"./geniehandler":5,"./settings":6,"./utils/polyfills":12}],2:[function(require,module,exports){
;(function(win){
	var store = {},
		doc = win.document,
		localStorageName = 'localStorage',
		scriptTag = 'script',
		storage

	store.disabled = false
	store.version = '1.3.17'
	store.set = function(key, value) {}
	store.get = function(key, defaultVal) {}
	store.has = function(key) { return store.get(key) !== undefined }
	store.remove = function(key) {}
	store.clear = function() {}
	store.transact = function(key, defaultVal, transactionFn) {
		if (transactionFn == null) {
			transactionFn = defaultVal
			defaultVal = null
		}
		if (defaultVal == null) {
			defaultVal = {}
		}
		var val = store.get(key, defaultVal)
		transactionFn(val)
		store.set(key, val)
	}
	store.getAll = function() {}
	store.forEach = function() {}

	store.serialize = function(value) {
		return JSON.stringify(value)
	}
	store.deserialize = function(value) {
		if (typeof value != 'string') { return undefined }
		try { return JSON.parse(value) }
		catch(e) { return value || undefined }
	}

	// Functions to encapsulate questionable FireFox 3.6.13 behavior
	// when about.config::dom.storage.enabled === false
	// See https://github.com/marcuswestin/store.js/issues#issue/13
	function isLocalStorageNameSupported() {
		try { return (localStorageName in win && win[localStorageName]) }
		catch(err) { return false }
	}

	if (isLocalStorageNameSupported()) {
		storage = win[localStorageName]
		store.set = function(key, val) {
			if (val === undefined) { return store.remove(key) }
			storage.setItem(key, store.serialize(val))
			return val
		}
		store.get = function(key, defaultVal) {
			var val = store.deserialize(storage.getItem(key))
			return (val === undefined ? defaultVal : val)
		}
		store.remove = function(key) { storage.removeItem(key) }
		store.clear = function() { storage.clear() }
		store.getAll = function() {
			var ret = {}
			store.forEach(function(key, val) {
				ret[key] = val
			})
			return ret
		}
		store.forEach = function(callback) {
			for (var i=0; i<storage.length; i++) {
				var key = storage.key(i)
				callback(key, store.get(key))
			}
		}
	} else if (doc.documentElement.addBehavior) {
		var storageOwner,
			storageContainer
		// Since #userData storage applies only to specific paths, we need to
		// somehow link our data to a specific path.  We choose /favicon.ico
		// as a pretty safe option, since all browsers already make a request to
		// this URL anyway and being a 404 will not hurt us here.  We wrap an
		// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
		// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
		// since the iframe access rules appear to allow direct access and
		// manipulation of the document element, even for a 404 page.  This
		// document can be used instead of the current document (which would
		// have been limited to the current path) to perform #userData storage.
		try {
			storageContainer = new ActiveXObject('htmlfile')
			storageContainer.open()
			storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>')
			storageContainer.close()
			storageOwner = storageContainer.w.frames[0].document
			storage = storageOwner.createElement('div')
		} catch(e) {
			// somehow ActiveXObject instantiation failed (perhaps some special
			// security settings or otherwse), fall back to per-path storage
			storage = doc.createElement('div')
			storageOwner = doc.body
		}
		var withIEStorage = function(storeFunction) {
			return function() {
				var args = Array.prototype.slice.call(arguments, 0)
				args.unshift(storage)
				// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
				// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
				storageOwner.appendChild(storage)
				storage.addBehavior('#default#userData')
				storage.load(localStorageName)
				var result = storeFunction.apply(store, args)
				storageOwner.removeChild(storage)
				return result
			}
		}

		// In IE7, keys cannot start with a digit or contain certain chars.
		// See https://github.com/marcuswestin/store.js/issues/40
		// See https://github.com/marcuswestin/store.js/issues/83
		var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
		function ieKeyFix(key) {
			return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___')
		}
		store.set = withIEStorage(function(storage, key, val) {
			key = ieKeyFix(key)
			if (val === undefined) { return store.remove(key) }
			storage.setAttribute(key, store.serialize(val))
			storage.save(localStorageName)
			return val
		})
		store.get = withIEStorage(function(storage, key, defaultVal) {
			key = ieKeyFix(key)
			var val = store.deserialize(storage.getAttribute(key))
			return (val === undefined ? defaultVal : val)
		})
		store.remove = withIEStorage(function(storage, key) {
			key = ieKeyFix(key)
			storage.removeAttribute(key)
			storage.save(localStorageName)
		})
		store.clear = withIEStorage(function(storage) {
			var attributes = storage.XMLDocument.documentElement.attributes
			storage.load(localStorageName)
			for (var i=0, attr; attr=attributes[i]; i++) {
				storage.removeAttribute(attr.name)
			}
			storage.save(localStorageName)
		})
		store.getAll = function(storage) {
			var ret = {}
			store.forEach(function(key, val) {
				ret[key] = val
			})
			return ret
		}
		store.forEach = withIEStorage(function(storage, callback) {
			var attributes = storage.XMLDocument.documentElement.attributes
			for (var i=0, attr; attr=attributes[i]; ++i) {
				callback(attr.name, store.deserialize(storage.getAttribute(attr.name)))
			}
		})
	}

	try {
		var testKey = '__storejs__'
		store.set(testKey, testKey)
		if (store.get(testKey) != testKey) { store.disabled = true }
		store.remove(testKey)
	} catch(e) {
		store.disabled = true
	}
	store.enabled = !store.disabled

	if (typeof module != 'undefined' && module.exports && this.module !== module) { module.exports = store }
	else if (typeof define === 'function' && define.amd) { define(store) }
	else { win.store = store }

})(Function('return this')());

},{}],3:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

module.exports = {
  PatternPrototype: {
    match: function(url) {
      var bound, captured, i, match, name, value, _i, _len;
      match = this.regex.exec(url);
      if (match == null) {
        return null;
      }
      captured = match.slice(1);
      if (this.isRegex) {
        return captured;
      }
      bound = {};
      for (i = _i = 0, _len = captured.length; _i < _len; i = ++_i) {
        value = captured[i];
        name = this.names[i];
        if (value == null) {
          continue;
        }
        if (name === '_') {
          if (bound._ == null) {
            bound._ = [];
          }
          bound._.push(value);
        } else {
          bound[name] = value;
        }
      }
      return bound;
    }
  },
  newPattern: function(arg, separator) {
    var isRegex, pattern, regexString;
    if (separator == null) {
      separator = '/';
    }
    isRegex = arg instanceof RegExp;
    if (!(('string' === typeof arg) || isRegex)) {
      throw new TypeError('argument must be a regex or a string');
    }
    [':', '*'].forEach(function(forbidden) {
      if (separator === forbidden) {
        throw new Error("separator can't be " + forbidden);
      }
    });
    pattern = Object.create(module.exports.PatternPrototype);
    pattern.isRegex = isRegex;
    pattern.regex = isRegex ? arg : (regexString = module.exports.toRegexString(arg, separator), new RegExp(regexString));
    if (!isRegex) {
      pattern.names = module.exports.getNames(arg, separator);
    }
    return pattern;
  },
  escapeForRegex: function(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  },
  getNames: function(arg, separator) {
    var escapedSeparator, name, names, regex, results;
    if (separator == null) {
      separator = '/';
    }
    if (arg instanceof RegExp) {
      return [];
    }
    escapedSeparator = module.exports.escapeForRegex(separator);
    regex = new RegExp("((:?:[^" + escapedSeparator + "\(\)]+)|(?:[\*]))", 'g');
    names = [];
    results = regex.exec(arg);
    while (results != null) {
      name = results[1].slice(1);
      if (name === '_') {
        throw new TypeError(":_ can't be used as a pattern name in pattern " + arg);
      }
      if (__indexOf.call(names, name) >= 0) {
        throw new TypeError("duplicate pattern name :" + name + " in pattern " + arg);
      }
      names.push(name || '_');
      results = regex.exec(arg);
    }
    return names;
  },
  escapeSeparators: function(string, separator) {
    var escapedSeparator, regex;
    if (separator == null) {
      separator = '/';
    }
    escapedSeparator = module.exports.escapeForRegex(separator);
    regex = new RegExp(escapedSeparator, 'g');
    return string.replace(regex, escapedSeparator);
  },
  toRegexString: function(string, separator) {
    var escapedSeparator, stringWithEscapedSeparators;
    if (separator == null) {
      separator = '/';
    }
    stringWithEscapedSeparators = module.exports.escapeSeparators(string, separator);
    stringWithEscapedSeparators = stringWithEscapedSeparators.replace(/\((.*?)\)/g, '(?:$1)?').replace(/\*/g, '(.*?)');
    escapedSeparator = module.exports.escapeForRegex(separator);
    module.exports.getNames(string, separator).forEach(function(name) {
      return stringWithEscapedSeparators = stringWithEscapedSeparators.replace(':' + name, "([^\\" + separator + "]+)");
    });
    return "^" + stringWithEscapedSeparators + "$";
  }
};

},{}],4:[function(require,module,exports){
// Check if GDMHandler should be called. 
var type = require('./utils/type'),
  log = require('./utils/log');
// A simple function for launching the GDM script

function launchGDM(flexId) {
  log('Launching GDM Script');
  (function(a) {
    var d = document,
      c = d.createElement("script");
    c.async = !0;
    c.defer = !0;
    c.src = a;
    d.getElementsByTagName('head')[0].appendChild(c);
  })((iatDev = (window.location.href.indexOf("iatDev=1") > -1 || document.cookie.indexOf("iatDev=1") > -1), "//" + (window.location.protocol === "http:" && !iatDev ? "h" : "") + "fp.gdmdigital.com/" + flexId + ".js?r=" + Math.random() * 1e16 + '&m=992&a=' + flexId + (iatDev ? "&d=1" : "")));
}
module.exports = {
  start: function(config) {
    if(!type(config, 'object')) {
      return;
    }
    if(config.exclude) {
      return;
    }
    launchGDM(config.flexId);
  }
};
},{"./utils/log":10,"./utils/type":14}],5:[function(require,module,exports){
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
      orderValue = getOrderValue() || config.orderValue.default,
      orderId = getOrderId(config.orderId) || (new Date()).getTime(),
      completionId = config.completionId,
      items, // retrieve itemString generated on the cart page
      journeyCode = config.journeyCode;
  
  nexusSrc = 'https://secure.adnxs.com/px?id=' + completionId + '&order_id=' +
    orderId + '&value=' + orderValue + '&t=2';
  
  addPixel(nexusSrc);
  log('AppNexus Pixel Added to complete page');
  
  if (journeyCode && journeyCode.length) {
    
    var params = {
      companyId: journeyCode,
      items: items,
      orderId: orderId
    };
    
    genieSrc = pixelSrc.adgenie(params, true) ;
    addPixel(genieSrc);
  }
}


// Add the ROS to the site when not on completion or product page. 
function createROSPixel (config) {
  
  src = pixelSrc.ros(config.segmentIds);
  
  addPixel(src);
    
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
  
  if (!$el.length) { return orderIdObject.default || timestamp; }
  
  var val = regexReplacementFromElement( $el, orderIdObject.regex, orderIdObject.default, timestamp);
     
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
    var val = regexReplacementFromElement( $el, orderValueObject.regex, orderValueObject.default );
    
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
},{"./settings":6,"./utils/addPixel":7,"./utils/checkElements":8,"./utils/criteria":9,"./utils/log":10,"./utils/pixelSrc":11,"./utils/store":13,"./utils/urls":15}],6:[function(require,module,exports){
/*
 *
 * This module is what determine the settings
 * for each module used in the application.
 */

var rawSettings = window.veTagData.settings.gdm;

module.exports = {
  gdm: {
    exclude: rawSettings.exclude,
    flexId: rawSettings.flexId
  },
  genie: {
    completionId: rawSettings.completionId,
    journeyCode: rawSettings.journeyCode,
    segmentIds: rawSettings.segmentIds,
    orderId: rawSettings.orderId,
    orderValue: rawSettings.orderValue,
    completePage: rawSettings.completePage,
    ros: rawSettings.ros,
    basketPages: rawSettings.basketPages,
    productPages: rawSettings.productPages
  },
  namespace: 'veapps.' + rawSettings.flexId + '.GDM.'
};
},{}],7:[function(require,module,exports){
// Add a pixel to the page. 
// 

function appendPixel( pixelPath ) {
  var pixel = document.createElement('img');
  pixel.width = 1;
  pixel.height = 1;
  pixel.src = pixelPath;
  pixel.style.visibility = 'hidden';
  document.body.appendChild(pixel);
  
  // To fix a bug where the pixel sometimes adds padding on certain pages
  setTimeout(function() {
    pixel.style.display = 'none';
  }, 1000);
}

module.exports = appendPixel;
},{}],8:[function(require,module,exports){
// Check to see if element exists if not keep checking every second until it is found. 
var log = require('./log'),
    type = require('./type'),
    $ = VEjQuery;

function interval(ms, maxRetries, fn) {
  var runTimes = 0;
  ms = ms || 1000;
  maxRetries = maxRetries || 600; // 10 min default
  var calledInterval = setInterval(function() {
    var stop = fn();
    runTimes++;
    if(stop || (maxRetries && runTimes >= maxRetries)) {
      log('Clearing Check Interval');
      clearInterval(calledInterval);
    }
  }, ms);
  return interval; // allow the interval to be cleared;
}

function checkElement (selector, successFn) {
  // when successful call the success function. 
  var calledInterval = interval(null, null, function(){
    var $el = $(selector);
    if ($el.length) {
      log('Success function is about to be called');
      clearInterval(calledInterval);
      successFn($el);
      return true;
    }
    return false;
  });
}

module.exports = {
  
  check: function( selector, successFn ) {
    log('Element is being checked');
    checkElement(selector, successFn);
  },
  
  // Keep checking in case an element updates. 
  // Should only be called once the element is present.
  // Checks occur every two seconds.
  checkUpdates: function( selector, oldVal, changedFn) {
    var stop, $el, newVal;
    var calledInterval = interval(2000, 1000, function() {
      $el = $(selector);
      newVal = getValOrText($el);
      if(!type(newVal, 'nan') && !type(newVal, 'null') &&
         !type(newVal, 'undefined') && (newVal !== oldVal) ) {
        stop = changedFn($el, newVal);
        if( stop ) { clearInterval(calledInterval); }
        oldVal = newVal;
      }
    });
  },
  
  // a callback function for basket pages and series data
  seriesCallBack: function($el, successFn) {
    var elementsArray = [];
    $el.each(function(index, el) {
      elementsArray.push($(el));
    });
  }
  
};


function getValOrText($el) {
  return $el.length ? $el.val() || $el.text() : null;
}
},{"./log":10,"./type":14}],9:[function(require,module,exports){
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


module.exports = criteria;
},{}],10:[function(require,module,exports){
function log() {
  if(veTagData.settings.consoleMessagesEnabled) {
    console.info(arguments);
  }
}

module.exports = log
},{}],11:[function(require,module,exports){
/**
 * This is a file for automatically generating the relevant pixels for our code.
 */
var SECURE = (window.location.protocol || 'https:') === 'https:' ? true : false,
    $ = window.VEjQuery,
    type = require('./type'),
    log = require('./log');


module.exports = {
  ros: function(segmentIds) {
    if(SECURE) {
      return '//secure.adnxs.com/seg?add=' + segmentIds[0] + ',' + segmentIds[1] + '&t=2';
    } else {
      return '//ib.adnxs.com/seg?add=' + segmentIds[0] + ',' + segmentIds[1] + '&t=2';
    }
  },
  
  // implement the genieTag with params 
  // set conversion to also place on the conversion page
  adgenie: function( params, conversion ) {

    var startString = '//adverts.adgenie.co.uk/' +
        (conversion ? 'conversion.php?' : 'genieTracker.php?'),
        paramNum = 0;
    
    if($.isEmptyObject(params)) {return startString;}
    
    $.each(params, function(key, val) {
      paramNum++;
      
      if (!val) {return;}
      
      startString = startString + key + '=' + val +
        (paramNum >= Object.size(params) ? '' : '&');
      
      log('Start String is now ' + startString + ' called this many times: ' + paramNum);
    });
    
    return startString;
  }
};
},{"./log":10,"./type":14}],12:[function(require,module,exports){
// Object.create
// 
if (typeof Object.create != 'function') {
  Object.create = (function() {
    var Temp = function() {};
    return function (prototype) {
      if (arguments.length > 1) {
        throw Error('Second argument not supported');
      }
      if (typeof prototype != 'object') {
        throw TypeError('Argument must be an object');
      }
      Temp.prototype = prototype;
      var result = new Temp();
      Temp.prototype = null;
      return result;
    };
  })();
}

Object.size = function(obj) {
  var size = 0,
    key;
  for(key in obj) {
    if(obj.hasOwnProperty(key)) size++;
  }
  return size;
};
// forEach
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback, thisArg) {

    var T, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}
},{}],13:[function(require,module,exports){
/**
 * Created with GDM.
 * User: ifiokjr
 * Date: 2015-01-06
 * Time: 09:47 AM
 * 
 * This file checks which methods to use for local storage. 
 */
var store = require('store'),
    type = require('./type'),
    noop = function() {},
    noStorage, simpleStorage,
    method = 'localStorage';

noStorage = {
  set: noop,
  get: noop,
  remove: noop,
  clear: noop,
  SUPPORT: 'none'
};

simpleStorage = {
  set: function( key, val ) {
    return window[method].setItem( key, val );
  },
  
  get: function ( key ) {
    return window[method].getItem( key );
  },
  
  remove: function( key ) {
    return window[method].removeItem( key );
  },
  
  clear: function( ) {
    return window[method].clear();
  },
  
  SUPPORT: 'simple'
};

var STORAGE_SUPPORTED = supportStorage(method);

function supportStorage(method) {
  var test = 'testStorage';
  try {
    window[method].setItem(test, test);
    window[method].removeItem(test);
    return true;
  } catch(e) {
    return false;
  }
}

if ( !STORAGE_SUPPORTED ) {
  storage = noStorage;
} else if (!type(JSON.parse, 'function') || !type(JSON.stringify, 'function')) {
  storage = simpleStorage;
} else {
  storage = store;
}

module.exports = storage;
},{"./type":14,"store":2}],14:[function(require,module,exports){
/**
 * toString ref.
 */
var toString = Object.prototype.toString;
/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api public
 */
module.exports = function(val, testType) {
  switch(toString.call(val)) {
    case '[object Date]':
      return testType === 'date';
    case '[object RegExp]':
      return testType === 'regexp';
    case '[object Arguments]':
      return testType === 'arguments';
    case '[object Array]':
      return testType === 'array';
    case '[object Error]':
      return testType === 'error';
  }
  if(val === null) return testType === 'null';
  if(val === undefined) return testType === 'undefined';
  if(val !== val) return 'nan';
  if(val && val.nodeType === 1) return testType === 'element';
  val = val.valueOf ? val.valueOf() : Object.prototype.valueOf.apply(val)
  return testType === typeof val;
};
},{}],15:[function(require,module,exports){
var urlPattern = require('url-pattern'),
    log = require('./log'),
    $ = window.VEjQuery;


var PAGE_URL = cleanUrl(window.location.hostname + window.location.pathname),
    PAGE_PARAMS = convertSearchToObject(window.location.search || '');
log('PAGE_URL and PAGE_PARAMS have been set.');

function convertSearchToObject(searchString) {
  if (searchString === '' || searchString === '?') { return {}; }
  var queries, ii, searchObject = {}, split;
  queries = searchString.replace(/^\?/, '').split('&');
  for(ii = 0; ii < queries.length; ii++) {
    split = queries[ii].split('=');
    searchObject[split[0]] = split[1];
  }
  return searchObject;
}


function cleanUrl(dirtyURL) {
  try {
    var url = new String(dirtyURL).toLowerCase();
    url = url.replace("http://", "");
    url = url.replace("https://", "");
    url = url.replace("#", "?");
    url = url.replace(";", "?");
    if( url.substr(0, 4) === 'www.' ) {
      url = url.replace('www.', '');
    }
    return url;
  } catch(err) {
    return '';
  }
}


function checkURLMatches(testPattern) {
  if(testPattern.substr(0, 4) === 'www.') {
    testPattern = testPattern.replace('www.', '');
  }
  var pattern = urlPattern.newPattern(testPattern);
  return !!pattern.match(PAGE_URL);
  log( 'Result of URLs matching is', match);
}


function checkParamsMatch(params) {
  var match = true;
  if(!params.length) {
    return true;
  }
  // loop through the params and make sure they are in the pageParams
  // for (key in pageParams)
  // TODO: Add support for splats [DONE]
  $.each(params, function(key, value) {
    key = string(key);
    value = String(value);
    var pattern = urlPattern.newPattern(value);
    if(!(pattern.match(PAGE_PARAMS[key]) || pattern.match(decodeURIComponent(PAGE_PARAMS[key])))) {
      match = false;
    }
  }); 
  log( 'Result of parameters matching is', match );
  return match;
}

module.exports = {
  
  test: function(pattern, params) {
    return checkURLMatches(pattern) && checkParamsMatch(params);
  }
  
};
},{"./log":10,"url-pattern":3}]},{},[1]);
