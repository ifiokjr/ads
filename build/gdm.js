(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/index.js":[function(require,module,exports){
var settings = require('./settings'), 
    gdmHandler = require('./gdmhandler'),
    genieHandler = require('./geniehandler');

// Firstly lets run the gdm handler. 
gdmHandler.start(settings.gdm);


// Now we run the Genie specific tags. 
genieHandler.start(settings.genie);

},{"./gdmhandler":"/home/codio/workspace/src/gdmhandler.js","./geniehandler":"/home/codio/workspace/src/geniehandler.js","./settings":"/home/codio/workspace/src/settings.js"}],"/home/codio/workspace/node_modules/bows/bows.js":[function(require,module,exports){
(function() {
  function checkColorSupport() {
    var chrome = !!window.chrome,
        firefox = /firefox/i.test(navigator.userAgent),
        firefoxVersion;

    if (firefox) {
        var match = navigator.userAgent.match(/Firefox\/(\d+\.\d+)/);
        if (match && match[1] && Number(match[1])) {
            firefoxVersion = Number(match[1]);
        }
    }
    return chrome || firefoxVersion >= 31.0;
  }

  var yieldColor = function() {
    var goldenRatio = 0.618033988749895;
    hue += goldenRatio;
    hue = hue % 1;
    return hue * 360;
  };

  var inNode = typeof window === 'undefined',
      ls = !inNode && window.localStorage,
      debugKey = ls.andlogKey || 'debug',
      debug = ls[debugKey],
      logger = require('andlog'),
      bind = Function.prototype.bind,
      hue = 0,
      padLength = 15,
      noop = function() {},
      colorsSupported = ls.debugColors || checkColorSupport(),
      bows = null,
      debugRegex = null,
      moduleColorsMap = {};

  debugRegex = debug && debug[0]==='/' && new RegExp(debug.substring(1,debug.length-1));

  var logLevels = ['log', 'debug', 'warn', 'error', 'info'];

  //Noop should noop
  for (var i = 0, ii = logLevels.length; i < ii; i++) {
      noop[ logLevels[i] ] = noop;
  }

  bows = function(str) {
    var msg, colorString, logfn;
    msg = (str.slice(0, padLength));
    msg += Array(padLength + 3 - msg.length).join(' ') + '|';

    if (debugRegex && !str.match(debugRegex)) return noop;

    if (!bind) return noop;

    var logArgs = [logger];
    if (colorsSupported) {
      if(!moduleColorsMap[str]){
        moduleColorsMap[str]= yieldColor();
      }
      var color = moduleColorsMap[str];
      msg = "%c" + msg;
      colorString = "color: hsl(" + (color) + ",99%,40%); font-weight: bold";

      logArgs.push(msg, colorString);
    }else{
      logArgs.push(msg);
    }

    if(arguments.length>1){
        var args = Array.prototype.slice.call(arguments, 1);
        logArgs = logArgs.concat(args);
    }

    logfn = bind.apply(logger.log, logArgs);

    logLevels.forEach(function (f) {
      logfn[f] = bind.apply(logger[f] || logfn, logArgs);
    });
    return logfn;
  };

  bows.config = function(config) {
    if (config.padLength) {
      padLength = config.padLength;
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = bows;
  } else {
    window.bows = bows;
  }
}).call();

},{"andlog":"/home/codio/workspace/node_modules/bows/node_modules/andlog/andlog.js"}],"/home/codio/workspace/node_modules/bows/node_modules/andlog/andlog.js":[function(require,module,exports){
// follow @HenrikJoreteg and @andyet if you like this ;)
(function () {
    var inNode = typeof window === 'undefined',
        ls = !inNode && window.localStorage,
        out = {};

    if (inNode) {
        module.exports = console;
        return;
    }

    var andlogKey = ls.andlogKey || 'debug'
    if (ls && ls[andlogKey] && window.console) {
        out = window.console;
    } else {
        var methods = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),
            l = methods.length,
            fn = function () {};

        while (l--) {
            out[methods[l]] = fn;
        }
    }
    if (typeof exports !== 'undefined') {
        module.exports = out;
    } else {
        window.console = out;
    }
})();

},{}],"/home/codio/workspace/node_modules/store/store.js":[function(require,module,exports){
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

},{}],"/home/codio/workspace/node_modules/url-pattern/src/url-pattern.js":[function(require,module,exports){
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

},{}],"/home/codio/workspace/src/gdmhandler.js":[function(require,module,exports){
// Check if GDMHandler should be called. 

var type = require( './utils/type' ), 
    log = require('bows')('GDM Handler');


// A simple function for launching the GDM script
function launchGDM() {
  log('Launching GDM Script');
  (function(a) { var d = document,c = d.createElement("script");c.async = !0, c.defer = !0, c.src = a, d.getElementsByTagName("head")[0].appendChild(c)})((iatDev = (window.location.href.indexOf("iatDev=1") > -1 || document.cookie.indexOf("iatDev=1") > -1), "//" + (window.location.protocol == "http:" && !iatDev ? "h" : "") + "fp.gdmdigital.com/" + flexId + ".js?r=" + Math.random() * 1e16 + '&m=992&a=' + flexId + (iatDev ? "&d=1" : "")));
}

module.exports = {
  start: function(config) {
    if ( !type(config, 'object') ) return;
    if (config.exclude) return;
    
    launchGDM(config.flexId);
  }
}; 
},{"./utils/type":"/home/codio/workspace/src/utils/type.js","bows":"/home/codio/workspace/node_modules/bows/bows.js"}],"/home/codio/workspace/src/geniehandler.js":[function(require,module,exports){
/*
 * Set up all the tags and pixels for VeGenie to work properly. 
 */

var store = require('store'),
    namespace = require('./settings').namespace,
    urlCheck = require('./utils/urls'),
    checkElement = require('./utils/checkElements'),
    addPixel = require('./utils/addPixel'),
    $ = window.VEjQuery,
    log = require('bows')('Genie Handler'),
    logOV = require('bows')('Order Value');


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
      orderValue = getOrderValue(),
      orderId = getOrderId(config.orderId),
      completionId = config.completionId;
  src = 'https://secure.adnxs.com/px?id=' + completionId + '&order_id=' +
    orderId + '&value=' + orderValue + '&t=2';
  
  addPixel(src);
  log('Pixel Added to complete page')
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
  $.each(config.completePage.urls, function(index, url) {
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
  return $el.text().replace(orderIdObject.regex, '') || $el.val().replace(orderIdObject.regex, '');
}


function checkForOrderValueSelector(orderValueObject) {
  logOV('Checking For Order Value');
  
  checkElement.check( orderValueObject.selector, function($el) {
    logOV('Order Value element found');
    var val = $el.val().replace(orderIdObject.regex, '') ||
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
  store.get(namespace + ORDERVALUE);
}
},{"./settings":"/home/codio/workspace/src/settings.js","./utils/addPixel":"/home/codio/workspace/src/utils/addPixel.js","./utils/checkElements":"/home/codio/workspace/src/utils/checkElements.js","./utils/urls":"/home/codio/workspace/src/utils/urls.js","bows":"/home/codio/workspace/node_modules/bows/bows.js","store":"/home/codio/workspace/node_modules/store/store.js"}],"/home/codio/workspace/src/settings.js":[function(require,module,exports){
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
  },
  namespace: 'veapps.' + rawSettings.flexId + '.GDM.'
};
},{}],"/home/codio/workspace/src/utils/addPixel.js":[function(require,module,exports){
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
},{}],"/home/codio/workspace/src/utils/checkElements.js":[function(require,module,exports){
// Check to see if element exists if not keep checking every second until it is found. 
var log = require('bows')('Check Elements');
var $ = VEjQuery;

function interval(ms, maxRetries, fn) {
  var runTimes = 0;
  ms = ms || 1000;
  maxRetries = maxRetries || 600; // 10 min default
  var interval = setInterval(function() {
    var stop = fn();
    runTimes++;
    if(stop || (maxRetries && runTimes >= maxRetries)) {
      log('Clearing Check Interval');
      clearInterval(interval);
    }
  }, ms);
  return interval; // allow the interval to be cleared;
}

function checkElement (selector, successFn) {
  // when successful call the success function. 
  var tries = interval(null, null, function(){
    var $el = $(selector);
    if ($el.length) {
      log('Success function is about to be called');
      clearInterval(tries);
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
  }
  
};
},{"bows":"/home/codio/workspace/node_modules/bows/bows.js"}],"/home/codio/workspace/src/utils/type.js":[function(require,module,exports){
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
},{}],"/home/codio/workspace/src/utils/urls.js":[function(require,module,exports){
var urlPattern = require('url-pattern'),
    log = require('bows')('URL Tests'),
    $ = window.VEjQuery;


var PAGE_URL = cleanUrl(window.location.hostname + window.location.pathname),
    PAGE_PARAMS = convertSearchToObject(window.location.search || '');
log('PAGE_URL and PAGE_PARAMS have been set.')

function convertSearchToObject(searchString) {
  var queries, ii, searchObject, split;
  queries = searchString.search.replace(/^\?/, '').split('&');
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
},{"bows":"/home/codio/workspace/node_modules/bows/bows.js","url-pattern":"/home/codio/workspace/node_modules/url-pattern/src/url-pattern.js"}]},{},["./src/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYm93cy9ib3dzLmpzIiwibm9kZV9tb2R1bGVzL2Jvd3Mvbm9kZV9tb2R1bGVzL2FuZGxvZy9hbmRsb2cuanMiLCJub2RlX21vZHVsZXMvc3RvcmUvc3RvcmUuanMiLCJub2RlX21vZHVsZXMvdXJsLXBhdHRlcm4vc3JjL3VybC1wYXR0ZXJuLmpzIiwic3JjL2dkbWhhbmRsZXIuanMiLCJzcmMvZ2VuaWVoYW5kbGVyLmpzIiwic3JjL3NldHRpbmdzLmpzIiwic3JjL3V0aWxzL2FkZFBpeGVsLmpzIiwic3JjL3V0aWxzL2NoZWNrRWxlbWVudHMuanMiLCJzcmMvdXRpbHMvdHlwZS5qcyIsInNyYy91dGlscy91cmxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBzZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKSwgXG4gICAgZ2RtSGFuZGxlciA9IHJlcXVpcmUoJy4vZ2RtaGFuZGxlcicpLFxuICAgIGdlbmllSGFuZGxlciA9IHJlcXVpcmUoJy4vZ2VuaWVoYW5kbGVyJyk7XG5cbi8vIEZpcnN0bHkgbGV0cyBydW4gdGhlIGdkbSBoYW5kbGVyLiBcbmdkbUhhbmRsZXIuc3RhcnQoc2V0dGluZ3MuZ2RtKTtcblxuXG4vLyBOb3cgd2UgcnVuIHRoZSBHZW5pZSBzcGVjaWZpYyB0YWdzLiBcbmdlbmllSGFuZGxlci5zdGFydChzZXR0aW5ncy5nZW5pZSk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIGNoZWNrQ29sb3JTdXBwb3J0KCkge1xuICAgIHZhciBjaHJvbWUgPSAhIXdpbmRvdy5jaHJvbWUsXG4gICAgICAgIGZpcmVmb3ggPSAvZmlyZWZveC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksXG4gICAgICAgIGZpcmVmb3hWZXJzaW9uO1xuXG4gICAgaWYgKGZpcmVmb3gpIHtcbiAgICAgICAgdmFyIG1hdGNoID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvRmlyZWZveFxcLyhcXGQrXFwuXFxkKykvKTtcbiAgICAgICAgaWYgKG1hdGNoICYmIG1hdGNoWzFdICYmIE51bWJlcihtYXRjaFsxXSkpIHtcbiAgICAgICAgICAgIGZpcmVmb3hWZXJzaW9uID0gTnVtYmVyKG1hdGNoWzFdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2hyb21lIHx8IGZpcmVmb3hWZXJzaW9uID49IDMxLjA7XG4gIH1cblxuICB2YXIgeWllbGRDb2xvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBnb2xkZW5SYXRpbyA9IDAuNjE4MDMzOTg4NzQ5ODk1O1xuICAgIGh1ZSArPSBnb2xkZW5SYXRpbztcbiAgICBodWUgPSBodWUgJSAxO1xuICAgIHJldHVybiBodWUgKiAzNjA7XG4gIH07XG5cbiAgdmFyIGluTm9kZSA9IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnLFxuICAgICAgbHMgPSAhaW5Ob2RlICYmIHdpbmRvdy5sb2NhbFN0b3JhZ2UsXG4gICAgICBkZWJ1Z0tleSA9IGxzLmFuZGxvZ0tleSB8fCAnZGVidWcnLFxuICAgICAgZGVidWcgPSBsc1tkZWJ1Z0tleV0sXG4gICAgICBsb2dnZXIgPSByZXF1aXJlKCdhbmRsb2cnKSxcbiAgICAgIGJpbmQgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCxcbiAgICAgIGh1ZSA9IDAsXG4gICAgICBwYWRMZW5ndGggPSAxNSxcbiAgICAgIG5vb3AgPSBmdW5jdGlvbigpIHt9LFxuICAgICAgY29sb3JzU3VwcG9ydGVkID0gbHMuZGVidWdDb2xvcnMgfHwgY2hlY2tDb2xvclN1cHBvcnQoKSxcbiAgICAgIGJvd3MgPSBudWxsLFxuICAgICAgZGVidWdSZWdleCA9IG51bGwsXG4gICAgICBtb2R1bGVDb2xvcnNNYXAgPSB7fTtcblxuICBkZWJ1Z1JlZ2V4ID0gZGVidWcgJiYgZGVidWdbMF09PT0nLycgJiYgbmV3IFJlZ0V4cChkZWJ1Zy5zdWJzdHJpbmcoMSxkZWJ1Zy5sZW5ndGgtMSkpO1xuXG4gIHZhciBsb2dMZXZlbHMgPSBbJ2xvZycsICdkZWJ1ZycsICd3YXJuJywgJ2Vycm9yJywgJ2luZm8nXTtcblxuICAvL05vb3Agc2hvdWxkIG5vb3BcbiAgZm9yICh2YXIgaSA9IDAsIGlpID0gbG9nTGV2ZWxzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgIG5vb3BbIGxvZ0xldmVsc1tpXSBdID0gbm9vcDtcbiAgfVxuXG4gIGJvd3MgPSBmdW5jdGlvbihzdHIpIHtcbiAgICB2YXIgbXNnLCBjb2xvclN0cmluZywgbG9nZm47XG4gICAgbXNnID0gKHN0ci5zbGljZSgwLCBwYWRMZW5ndGgpKTtcbiAgICBtc2cgKz0gQXJyYXkocGFkTGVuZ3RoICsgMyAtIG1zZy5sZW5ndGgpLmpvaW4oJyAnKSArICd8JztcblxuICAgIGlmIChkZWJ1Z1JlZ2V4ICYmICFzdHIubWF0Y2goZGVidWdSZWdleCkpIHJldHVybiBub29wO1xuXG4gICAgaWYgKCFiaW5kKSByZXR1cm4gbm9vcDtcblxuICAgIHZhciBsb2dBcmdzID0gW2xvZ2dlcl07XG4gICAgaWYgKGNvbG9yc1N1cHBvcnRlZCkge1xuICAgICAgaWYoIW1vZHVsZUNvbG9yc01hcFtzdHJdKXtcbiAgICAgICAgbW9kdWxlQ29sb3JzTWFwW3N0cl09IHlpZWxkQ29sb3IoKTtcbiAgICAgIH1cbiAgICAgIHZhciBjb2xvciA9IG1vZHVsZUNvbG9yc01hcFtzdHJdO1xuICAgICAgbXNnID0gXCIlY1wiICsgbXNnO1xuICAgICAgY29sb3JTdHJpbmcgPSBcImNvbG9yOiBoc2woXCIgKyAoY29sb3IpICsgXCIsOTklLDQwJSk7IGZvbnQtd2VpZ2h0OiBib2xkXCI7XG5cbiAgICAgIGxvZ0FyZ3MucHVzaChtc2csIGNvbG9yU3RyaW5nKTtcbiAgICB9ZWxzZXtcbiAgICAgIGxvZ0FyZ3MucHVzaChtc2cpO1xuICAgIH1cblxuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGg+MSl7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgbG9nQXJncyA9IGxvZ0FyZ3MuY29uY2F0KGFyZ3MpO1xuICAgIH1cblxuICAgIGxvZ2ZuID0gYmluZC5hcHBseShsb2dnZXIubG9nLCBsb2dBcmdzKTtcblxuICAgIGxvZ0xldmVscy5mb3JFYWNoKGZ1bmN0aW9uIChmKSB7XG4gICAgICBsb2dmbltmXSA9IGJpbmQuYXBwbHkobG9nZ2VyW2ZdIHx8IGxvZ2ZuLCBsb2dBcmdzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbG9nZm47XG4gIH07XG5cbiAgYm93cy5jb25maWcgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgICBpZiAoY29uZmlnLnBhZExlbmd0aCkge1xuICAgICAgcGFkTGVuZ3RoID0gY29uZmlnLnBhZExlbmd0aDtcbiAgICB9XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBib3dzO1xuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5ib3dzID0gYm93cztcbiAgfVxufSkuY2FsbCgpO1xuIiwiLy8gZm9sbG93IEBIZW5yaWtKb3JldGVnIGFuZCBAYW5keWV0IGlmIHlvdSBsaWtlIHRoaXMgOylcbihmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGluTm9kZSA9IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnLFxuICAgICAgICBscyA9ICFpbk5vZGUgJiYgd2luZG93LmxvY2FsU3RvcmFnZSxcbiAgICAgICAgb3V0ID0ge307XG5cbiAgICBpZiAoaW5Ob2RlKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gY29uc29sZTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBhbmRsb2dLZXkgPSBscy5hbmRsb2dLZXkgfHwgJ2RlYnVnJ1xuICAgIGlmIChscyAmJiBsc1thbmRsb2dLZXldICYmIHdpbmRvdy5jb25zb2xlKSB7XG4gICAgICAgIG91dCA9IHdpbmRvdy5jb25zb2xlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBtZXRob2RzID0gXCJhc3NlcnQsY291bnQsZGVidWcsZGlyLGRpcnhtbCxlcnJvcixleGNlcHRpb24sZ3JvdXAsZ3JvdXBDb2xsYXBzZWQsZ3JvdXBFbmQsaW5mbyxsb2csbWFya1RpbWVsaW5lLHByb2ZpbGUscHJvZmlsZUVuZCx0aW1lLHRpbWVFbmQsdHJhY2Usd2FyblwiLnNwbGl0KFwiLFwiKSxcbiAgICAgICAgICAgIGwgPSBtZXRob2RzLmxlbmd0aCxcbiAgICAgICAgICAgIGZuID0gZnVuY3Rpb24gKCkge307XG5cbiAgICAgICAgd2hpbGUgKGwtLSkge1xuICAgICAgICAgICAgb3V0W21ldGhvZHNbbF1dID0gZm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IG91dDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB3aW5kb3cuY29uc29sZSA9IG91dDtcbiAgICB9XG59KSgpO1xuIiwiOyhmdW5jdGlvbih3aW4pe1xuXHR2YXIgc3RvcmUgPSB7fSxcblx0XHRkb2MgPSB3aW4uZG9jdW1lbnQsXG5cdFx0bG9jYWxTdG9yYWdlTmFtZSA9ICdsb2NhbFN0b3JhZ2UnLFxuXHRcdHNjcmlwdFRhZyA9ICdzY3JpcHQnLFxuXHRcdHN0b3JhZ2VcblxuXHRzdG9yZS5kaXNhYmxlZCA9IGZhbHNlXG5cdHN0b3JlLnZlcnNpb24gPSAnMS4zLjE3J1xuXHRzdG9yZS5zZXQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7fVxuXHRzdG9yZS5nZXQgPSBmdW5jdGlvbihrZXksIGRlZmF1bHRWYWwpIHt9XG5cdHN0b3JlLmhhcyA9IGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gc3RvcmUuZ2V0KGtleSkgIT09IHVuZGVmaW5lZCB9XG5cdHN0b3JlLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSkge31cblx0c3RvcmUuY2xlYXIgPSBmdW5jdGlvbigpIHt9XG5cdHN0b3JlLnRyYW5zYWN0ID0gZnVuY3Rpb24oa2V5LCBkZWZhdWx0VmFsLCB0cmFuc2FjdGlvbkZuKSB7XG5cdFx0aWYgKHRyYW5zYWN0aW9uRm4gPT0gbnVsbCkge1xuXHRcdFx0dHJhbnNhY3Rpb25GbiA9IGRlZmF1bHRWYWxcblx0XHRcdGRlZmF1bHRWYWwgPSBudWxsXG5cdFx0fVxuXHRcdGlmIChkZWZhdWx0VmFsID09IG51bGwpIHtcblx0XHRcdGRlZmF1bHRWYWwgPSB7fVxuXHRcdH1cblx0XHR2YXIgdmFsID0gc3RvcmUuZ2V0KGtleSwgZGVmYXVsdFZhbClcblx0XHR0cmFuc2FjdGlvbkZuKHZhbClcblx0XHRzdG9yZS5zZXQoa2V5LCB2YWwpXG5cdH1cblx0c3RvcmUuZ2V0QWxsID0gZnVuY3Rpb24oKSB7fVxuXHRzdG9yZS5mb3JFYWNoID0gZnVuY3Rpb24oKSB7fVxuXG5cdHN0b3JlLnNlcmlhbGl6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKVxuXHR9XG5cdHN0b3JlLmRlc2VyaWFsaXplID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRpZiAodHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSB7IHJldHVybiB1bmRlZmluZWQgfVxuXHRcdHRyeSB7IHJldHVybiBKU09OLnBhcnNlKHZhbHVlKSB9XG5cdFx0Y2F0Y2goZSkgeyByZXR1cm4gdmFsdWUgfHwgdW5kZWZpbmVkIH1cblx0fVxuXG5cdC8vIEZ1bmN0aW9ucyB0byBlbmNhcHN1bGF0ZSBxdWVzdGlvbmFibGUgRmlyZUZveCAzLjYuMTMgYmVoYXZpb3Jcblx0Ly8gd2hlbiBhYm91dC5jb25maWc6OmRvbS5zdG9yYWdlLmVuYWJsZWQgPT09IGZhbHNlXG5cdC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFyY3Vzd2VzdGluL3N0b3JlLmpzL2lzc3VlcyNpc3N1ZS8xM1xuXHRmdW5jdGlvbiBpc0xvY2FsU3RvcmFnZU5hbWVTdXBwb3J0ZWQoKSB7XG5cdFx0dHJ5IHsgcmV0dXJuIChsb2NhbFN0b3JhZ2VOYW1lIGluIHdpbiAmJiB3aW5bbG9jYWxTdG9yYWdlTmFtZV0pIH1cblx0XHRjYXRjaChlcnIpIHsgcmV0dXJuIGZhbHNlIH1cblx0fVxuXG5cdGlmIChpc0xvY2FsU3RvcmFnZU5hbWVTdXBwb3J0ZWQoKSkge1xuXHRcdHN0b3JhZ2UgPSB3aW5bbG9jYWxTdG9yYWdlTmFtZV1cblx0XHRzdG9yZS5zZXQgPSBmdW5jdGlvbihrZXksIHZhbCkge1xuXHRcdFx0aWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiBzdG9yZS5yZW1vdmUoa2V5KSB9XG5cdFx0XHRzdG9yYWdlLnNldEl0ZW0oa2V5LCBzdG9yZS5zZXJpYWxpemUodmFsKSlcblx0XHRcdHJldHVybiB2YWxcblx0XHR9XG5cdFx0c3RvcmUuZ2V0ID0gZnVuY3Rpb24oa2V5LCBkZWZhdWx0VmFsKSB7XG5cdFx0XHR2YXIgdmFsID0gc3RvcmUuZGVzZXJpYWxpemUoc3RvcmFnZS5nZXRJdGVtKGtleSkpXG5cdFx0XHRyZXR1cm4gKHZhbCA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFZhbCA6IHZhbClcblx0XHR9XG5cdFx0c3RvcmUucmVtb3ZlID0gZnVuY3Rpb24oa2V5KSB7IHN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpIH1cblx0XHRzdG9yZS5jbGVhciA9IGZ1bmN0aW9uKCkgeyBzdG9yYWdlLmNsZWFyKCkgfVxuXHRcdHN0b3JlLmdldEFsbCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHJldCA9IHt9XG5cdFx0XHRzdG9yZS5mb3JFYWNoKGZ1bmN0aW9uKGtleSwgdmFsKSB7XG5cdFx0XHRcdHJldFtrZXldID0gdmFsXG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuIHJldFxuXHRcdH1cblx0XHRzdG9yZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0XHRcdGZvciAodmFyIGk9MDsgaTxzdG9yYWdlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBrZXkgPSBzdG9yYWdlLmtleShpKVxuXHRcdFx0XHRjYWxsYmFjayhrZXksIHN0b3JlLmdldChrZXkpKVxuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIGlmIChkb2MuZG9jdW1lbnRFbGVtZW50LmFkZEJlaGF2aW9yKSB7XG5cdFx0dmFyIHN0b3JhZ2VPd25lcixcblx0XHRcdHN0b3JhZ2VDb250YWluZXJcblx0XHQvLyBTaW5jZSAjdXNlckRhdGEgc3RvcmFnZSBhcHBsaWVzIG9ubHkgdG8gc3BlY2lmaWMgcGF0aHMsIHdlIG5lZWQgdG9cblx0XHQvLyBzb21laG93IGxpbmsgb3VyIGRhdGEgdG8gYSBzcGVjaWZpYyBwYXRoLiAgV2UgY2hvb3NlIC9mYXZpY29uLmljb1xuXHRcdC8vIGFzIGEgcHJldHR5IHNhZmUgb3B0aW9uLCBzaW5jZSBhbGwgYnJvd3NlcnMgYWxyZWFkeSBtYWtlIGEgcmVxdWVzdCB0b1xuXHRcdC8vIHRoaXMgVVJMIGFueXdheSBhbmQgYmVpbmcgYSA0MDQgd2lsbCBub3QgaHVydCB1cyBoZXJlLiAgV2Ugd3JhcCBhblxuXHRcdC8vIGlmcmFtZSBwb2ludGluZyB0byB0aGUgZmF2aWNvbiBpbiBhbiBBY3RpdmVYT2JqZWN0KGh0bWxmaWxlKSBvYmplY3Rcblx0XHQvLyAoc2VlOiBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvYWE3NTI1NzQodj1WUy44NSkuYXNweClcblx0XHQvLyBzaW5jZSB0aGUgaWZyYW1lIGFjY2VzcyBydWxlcyBhcHBlYXIgdG8gYWxsb3cgZGlyZWN0IGFjY2VzcyBhbmRcblx0XHQvLyBtYW5pcHVsYXRpb24gb2YgdGhlIGRvY3VtZW50IGVsZW1lbnQsIGV2ZW4gZm9yIGEgNDA0IHBhZ2UuICBUaGlzXG5cdFx0Ly8gZG9jdW1lbnQgY2FuIGJlIHVzZWQgaW5zdGVhZCBvZiB0aGUgY3VycmVudCBkb2N1bWVudCAod2hpY2ggd291bGRcblx0XHQvLyBoYXZlIGJlZW4gbGltaXRlZCB0byB0aGUgY3VycmVudCBwYXRoKSB0byBwZXJmb3JtICN1c2VyRGF0YSBzdG9yYWdlLlxuXHRcdHRyeSB7XG5cdFx0XHRzdG9yYWdlQ29udGFpbmVyID0gbmV3IEFjdGl2ZVhPYmplY3QoJ2h0bWxmaWxlJylcblx0XHRcdHN0b3JhZ2VDb250YWluZXIub3BlbigpXG5cdFx0XHRzdG9yYWdlQ29udGFpbmVyLndyaXRlKCc8JytzY3JpcHRUYWcrJz5kb2N1bWVudC53PXdpbmRvdzwvJytzY3JpcHRUYWcrJz48aWZyYW1lIHNyYz1cIi9mYXZpY29uLmljb1wiPjwvaWZyYW1lPicpXG5cdFx0XHRzdG9yYWdlQ29udGFpbmVyLmNsb3NlKClcblx0XHRcdHN0b3JhZ2VPd25lciA9IHN0b3JhZ2VDb250YWluZXIudy5mcmFtZXNbMF0uZG9jdW1lbnRcblx0XHRcdHN0b3JhZ2UgPSBzdG9yYWdlT3duZXIuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdC8vIHNvbWVob3cgQWN0aXZlWE9iamVjdCBpbnN0YW50aWF0aW9uIGZhaWxlZCAocGVyaGFwcyBzb21lIHNwZWNpYWxcblx0XHRcdC8vIHNlY3VyaXR5IHNldHRpbmdzIG9yIG90aGVyd3NlKSwgZmFsbCBiYWNrIHRvIHBlci1wYXRoIHN0b3JhZ2Vcblx0XHRcdHN0b3JhZ2UgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0XHRcdHN0b3JhZ2VPd25lciA9IGRvYy5ib2R5XG5cdFx0fVxuXHRcdHZhciB3aXRoSUVTdG9yYWdlID0gZnVuY3Rpb24oc3RvcmVGdW5jdGlvbikge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMClcblx0XHRcdFx0YXJncy51bnNoaWZ0KHN0b3JhZ2UpXG5cdFx0XHRcdC8vIFNlZSBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvbXM1MzEwODEodj1WUy44NSkuYXNweFxuXHRcdFx0XHQvLyBhbmQgaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21zNTMxNDI0KHY9VlMuODUpLmFzcHhcblx0XHRcdFx0c3RvcmFnZU93bmVyLmFwcGVuZENoaWxkKHN0b3JhZ2UpXG5cdFx0XHRcdHN0b3JhZ2UuYWRkQmVoYXZpb3IoJyNkZWZhdWx0I3VzZXJEYXRhJylcblx0XHRcdFx0c3RvcmFnZS5sb2FkKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0XHRcdHZhciByZXN1bHQgPSBzdG9yZUZ1bmN0aW9uLmFwcGx5KHN0b3JlLCBhcmdzKVxuXHRcdFx0XHRzdG9yYWdlT3duZXIucmVtb3ZlQ2hpbGQoc3RvcmFnZSlcblx0XHRcdFx0cmV0dXJuIHJlc3VsdFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEluIElFNywga2V5cyBjYW5ub3Qgc3RhcnQgd2l0aCBhIGRpZ2l0IG9yIGNvbnRhaW4gY2VydGFpbiBjaGFycy5cblx0XHQvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcmN1c3dlc3Rpbi9zdG9yZS5qcy9pc3N1ZXMvNDBcblx0XHQvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcmN1c3dlc3Rpbi9zdG9yZS5qcy9pc3N1ZXMvODNcblx0XHR2YXIgZm9yYmlkZGVuQ2hhcnNSZWdleCA9IG5ldyBSZWdFeHAoXCJbIVxcXCIjJCUmJygpKissL1xcXFxcXFxcOjs8PT4/QFtcXFxcXV5ge3x9fl1cIiwgXCJnXCIpXG5cdFx0ZnVuY3Rpb24gaWVLZXlGaXgoa2V5KSB7XG5cdFx0XHRyZXR1cm4ga2V5LnJlcGxhY2UoL15kLywgJ19fXyQmJykucmVwbGFjZShmb3JiaWRkZW5DaGFyc1JlZ2V4LCAnX19fJylcblx0XHR9XG5cdFx0c3RvcmUuc2V0ID0gd2l0aElFU3RvcmFnZShmdW5jdGlvbihzdG9yYWdlLCBrZXksIHZhbCkge1xuXHRcdFx0a2V5ID0gaWVLZXlGaXgoa2V5KVxuXHRcdFx0aWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiBzdG9yZS5yZW1vdmUoa2V5KSB9XG5cdFx0XHRzdG9yYWdlLnNldEF0dHJpYnV0ZShrZXksIHN0b3JlLnNlcmlhbGl6ZSh2YWwpKVxuXHRcdFx0c3RvcmFnZS5zYXZlKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0XHRyZXR1cm4gdmFsXG5cdFx0fSlcblx0XHRzdG9yZS5nZXQgPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UsIGtleSwgZGVmYXVsdFZhbCkge1xuXHRcdFx0a2V5ID0gaWVLZXlGaXgoa2V5KVxuXHRcdFx0dmFyIHZhbCA9IHN0b3JlLmRlc2VyaWFsaXplKHN0b3JhZ2UuZ2V0QXR0cmlidXRlKGtleSkpXG5cdFx0XHRyZXR1cm4gKHZhbCA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFZhbCA6IHZhbClcblx0XHR9KVxuXHRcdHN0b3JlLnJlbW92ZSA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSwga2V5KSB7XG5cdFx0XHRrZXkgPSBpZUtleUZpeChrZXkpXG5cdFx0XHRzdG9yYWdlLnJlbW92ZUF0dHJpYnV0ZShrZXkpXG5cdFx0XHRzdG9yYWdlLnNhdmUobG9jYWxTdG9yYWdlTmFtZSlcblx0XHR9KVxuXHRcdHN0b3JlLmNsZWFyID0gd2l0aElFU3RvcmFnZShmdW5jdGlvbihzdG9yYWdlKSB7XG5cdFx0XHR2YXIgYXR0cmlidXRlcyA9IHN0b3JhZ2UuWE1MRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dHJpYnV0ZXNcblx0XHRcdHN0b3JhZ2UubG9hZChsb2NhbFN0b3JhZ2VOYW1lKVxuXHRcdFx0Zm9yICh2YXIgaT0wLCBhdHRyOyBhdHRyPWF0dHJpYnV0ZXNbaV07IGkrKykge1xuXHRcdFx0XHRzdG9yYWdlLnJlbW92ZUF0dHJpYnV0ZShhdHRyLm5hbWUpXG5cdFx0XHR9XG5cdFx0XHRzdG9yYWdlLnNhdmUobG9jYWxTdG9yYWdlTmFtZSlcblx0XHR9KVxuXHRcdHN0b3JlLmdldEFsbCA9IGZ1bmN0aW9uKHN0b3JhZ2UpIHtcblx0XHRcdHZhciByZXQgPSB7fVxuXHRcdFx0c3RvcmUuZm9yRWFjaChmdW5jdGlvbihrZXksIHZhbCkge1xuXHRcdFx0XHRyZXRba2V5XSA9IHZhbFxuXHRcdFx0fSlcblx0XHRcdHJldHVybiByZXRcblx0XHR9XG5cdFx0c3RvcmUuZm9yRWFjaCA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSwgY2FsbGJhY2spIHtcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gc3RvcmFnZS5YTUxEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXR0cmlidXRlc1xuXHRcdFx0Zm9yICh2YXIgaT0wLCBhdHRyOyBhdHRyPWF0dHJpYnV0ZXNbaV07ICsraSkge1xuXHRcdFx0XHRjYWxsYmFjayhhdHRyLm5hbWUsIHN0b3JlLmRlc2VyaWFsaXplKHN0b3JhZ2UuZ2V0QXR0cmlidXRlKGF0dHIubmFtZSkpKVxuXHRcdFx0fVxuXHRcdH0pXG5cdH1cblxuXHR0cnkge1xuXHRcdHZhciB0ZXN0S2V5ID0gJ19fc3RvcmVqc19fJ1xuXHRcdHN0b3JlLnNldCh0ZXN0S2V5LCB0ZXN0S2V5KVxuXHRcdGlmIChzdG9yZS5nZXQodGVzdEtleSkgIT0gdGVzdEtleSkgeyBzdG9yZS5kaXNhYmxlZCA9IHRydWUgfVxuXHRcdHN0b3JlLnJlbW92ZSh0ZXN0S2V5KVxuXHR9IGNhdGNoKGUpIHtcblx0XHRzdG9yZS5kaXNhYmxlZCA9IHRydWVcblx0fVxuXHRzdG9yZS5lbmFibGVkID0gIXN0b3JlLmRpc2FibGVkXG5cblx0aWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMgJiYgdGhpcy5tb2R1bGUgIT09IG1vZHVsZSkgeyBtb2R1bGUuZXhwb3J0cyA9IHN0b3JlIH1cblx0ZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7IGRlZmluZShzdG9yZSkgfVxuXHRlbHNlIHsgd2luLnN0b3JlID0gc3RvcmUgfVxuXG59KShGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpKTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS43LjFcbnZhciBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFBhdHRlcm5Qcm90b3R5cGU6IHtcbiAgICBtYXRjaDogZnVuY3Rpb24odXJsKSB7XG4gICAgICB2YXIgYm91bmQsIGNhcHR1cmVkLCBpLCBtYXRjaCwgbmFtZSwgdmFsdWUsIF9pLCBfbGVuO1xuICAgICAgbWF0Y2ggPSB0aGlzLnJlZ2V4LmV4ZWModXJsKTtcbiAgICAgIGlmIChtYXRjaCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgY2FwdHVyZWQgPSBtYXRjaC5zbGljZSgxKTtcbiAgICAgIGlmICh0aGlzLmlzUmVnZXgpIHtcbiAgICAgICAgcmV0dXJuIGNhcHR1cmVkO1xuICAgICAgfVxuICAgICAgYm91bmQgPSB7fTtcbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX2xlbiA9IGNhcHR1cmVkLmxlbmd0aDsgX2kgPCBfbGVuOyBpID0gKytfaSkge1xuICAgICAgICB2YWx1ZSA9IGNhcHR1cmVkW2ldO1xuICAgICAgICBuYW1lID0gdGhpcy5uYW1lc1tpXTtcbiAgICAgICAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZSA9PT0gJ18nKSB7XG4gICAgICAgICAgaWYgKGJvdW5kLl8gPT0gbnVsbCkge1xuICAgICAgICAgICAgYm91bmQuXyA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBib3VuZC5fLnB1c2godmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJvdW5kW25hbWVdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBib3VuZDtcbiAgICB9XG4gIH0sXG4gIG5ld1BhdHRlcm46IGZ1bmN0aW9uKGFyZywgc2VwYXJhdG9yKSB7XG4gICAgdmFyIGlzUmVnZXgsIHBhdHRlcm4sIHJlZ2V4U3RyaW5nO1xuICAgIGlmIChzZXBhcmF0b3IgPT0gbnVsbCkge1xuICAgICAgc2VwYXJhdG9yID0gJy8nO1xuICAgIH1cbiAgICBpc1JlZ2V4ID0gYXJnIGluc3RhbmNlb2YgUmVnRXhwO1xuICAgIGlmICghKCgnc3RyaW5nJyA9PT0gdHlwZW9mIGFyZykgfHwgaXNSZWdleCkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2FyZ3VtZW50IG11c3QgYmUgYSByZWdleCBvciBhIHN0cmluZycpO1xuICAgIH1cbiAgICBbJzonLCAnKiddLmZvckVhY2goZnVuY3Rpb24oZm9yYmlkZGVuKSB7XG4gICAgICBpZiAoc2VwYXJhdG9yID09PSBmb3JiaWRkZW4pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwic2VwYXJhdG9yIGNhbid0IGJlIFwiICsgZm9yYmlkZGVuKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBwYXR0ZXJuID0gT2JqZWN0LmNyZWF0ZShtb2R1bGUuZXhwb3J0cy5QYXR0ZXJuUHJvdG90eXBlKTtcbiAgICBwYXR0ZXJuLmlzUmVnZXggPSBpc1JlZ2V4O1xuICAgIHBhdHRlcm4ucmVnZXggPSBpc1JlZ2V4ID8gYXJnIDogKHJlZ2V4U3RyaW5nID0gbW9kdWxlLmV4cG9ydHMudG9SZWdleFN0cmluZyhhcmcsIHNlcGFyYXRvciksIG5ldyBSZWdFeHAocmVnZXhTdHJpbmcpKTtcbiAgICBpZiAoIWlzUmVnZXgpIHtcbiAgICAgIHBhdHRlcm4ubmFtZXMgPSBtb2R1bGUuZXhwb3J0cy5nZXROYW1lcyhhcmcsIHNlcGFyYXRvcik7XG4gICAgfVxuICAgIHJldHVybiBwYXR0ZXJuO1xuICB9LFxuICBlc2NhcGVGb3JSZWdleDogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9bLVxcL1xcXFxeJCorPy4oKXxbXFxde31dL2csICdcXFxcJCYnKTtcbiAgfSxcbiAgZ2V0TmFtZXM6IGZ1bmN0aW9uKGFyZywgc2VwYXJhdG9yKSB7XG4gICAgdmFyIGVzY2FwZWRTZXBhcmF0b3IsIG5hbWUsIG5hbWVzLCByZWdleCwgcmVzdWx0cztcbiAgICBpZiAoc2VwYXJhdG9yID09IG51bGwpIHtcbiAgICAgIHNlcGFyYXRvciA9ICcvJztcbiAgICB9XG4gICAgaWYgKGFyZyBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBlc2NhcGVkU2VwYXJhdG9yID0gbW9kdWxlLmV4cG9ydHMuZXNjYXBlRm9yUmVnZXgoc2VwYXJhdG9yKTtcbiAgICByZWdleCA9IG5ldyBSZWdFeHAoXCIoKDo/OlteXCIgKyBlc2NhcGVkU2VwYXJhdG9yICsgXCJcXChcXCldKyl8KD86W1xcKl0pKVwiLCAnZycpO1xuICAgIG5hbWVzID0gW107XG4gICAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMoYXJnKTtcbiAgICB3aGlsZSAocmVzdWx0cyAhPSBudWxsKSB7XG4gICAgICBuYW1lID0gcmVzdWx0c1sxXS5zbGljZSgxKTtcbiAgICAgIGlmIChuYW1lID09PSAnXycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIjpfIGNhbid0IGJlIHVzZWQgYXMgYSBwYXR0ZXJuIG5hbWUgaW4gcGF0dGVybiBcIiArIGFyZyk7XG4gICAgICB9XG4gICAgICBpZiAoX19pbmRleE9mLmNhbGwobmFtZXMsIG5hbWUpID49IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImR1cGxpY2F0ZSBwYXR0ZXJuIG5hbWUgOlwiICsgbmFtZSArIFwiIGluIHBhdHRlcm4gXCIgKyBhcmcpO1xuICAgICAgfVxuICAgICAgbmFtZXMucHVzaChuYW1lIHx8ICdfJyk7XG4gICAgICByZXN1bHRzID0gcmVnZXguZXhlYyhhcmcpO1xuICAgIH1cbiAgICByZXR1cm4gbmFtZXM7XG4gIH0sXG4gIGVzY2FwZVNlcGFyYXRvcnM6IGZ1bmN0aW9uKHN0cmluZywgc2VwYXJhdG9yKSB7XG4gICAgdmFyIGVzY2FwZWRTZXBhcmF0b3IsIHJlZ2V4O1xuICAgIGlmIChzZXBhcmF0b3IgPT0gbnVsbCkge1xuICAgICAgc2VwYXJhdG9yID0gJy8nO1xuICAgIH1cbiAgICBlc2NhcGVkU2VwYXJhdG9yID0gbW9kdWxlLmV4cG9ydHMuZXNjYXBlRm9yUmVnZXgoc2VwYXJhdG9yKTtcbiAgICByZWdleCA9IG5ldyBSZWdFeHAoZXNjYXBlZFNlcGFyYXRvciwgJ2cnKTtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UocmVnZXgsIGVzY2FwZWRTZXBhcmF0b3IpO1xuICB9LFxuICB0b1JlZ2V4U3RyaW5nOiBmdW5jdGlvbihzdHJpbmcsIHNlcGFyYXRvcikge1xuICAgIHZhciBlc2NhcGVkU2VwYXJhdG9yLCBzdHJpbmdXaXRoRXNjYXBlZFNlcGFyYXRvcnM7XG4gICAgaWYgKHNlcGFyYXRvciA9PSBudWxsKSB7XG4gICAgICBzZXBhcmF0b3IgPSAnLyc7XG4gICAgfVxuICAgIHN0cmluZ1dpdGhFc2NhcGVkU2VwYXJhdG9ycyA9IG1vZHVsZS5leHBvcnRzLmVzY2FwZVNlcGFyYXRvcnMoc3RyaW5nLCBzZXBhcmF0b3IpO1xuICAgIHN0cmluZ1dpdGhFc2NhcGVkU2VwYXJhdG9ycyA9IHN0cmluZ1dpdGhFc2NhcGVkU2VwYXJhdG9ycy5yZXBsYWNlKC9cXCgoLio/KVxcKS9nLCAnKD86JDEpPycpLnJlcGxhY2UoL1xcKi9nLCAnKC4qPyknKTtcbiAgICBlc2NhcGVkU2VwYXJhdG9yID0gbW9kdWxlLmV4cG9ydHMuZXNjYXBlRm9yUmVnZXgoc2VwYXJhdG9yKTtcbiAgICBtb2R1bGUuZXhwb3J0cy5nZXROYW1lcyhzdHJpbmcsIHNlcGFyYXRvcikuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICByZXR1cm4gc3RyaW5nV2l0aEVzY2FwZWRTZXBhcmF0b3JzID0gc3RyaW5nV2l0aEVzY2FwZWRTZXBhcmF0b3JzLnJlcGxhY2UoJzonICsgbmFtZSwgXCIoW15cXFxcXCIgKyBzZXBhcmF0b3IgKyBcIl0rKVwiKTtcbiAgICB9KTtcbiAgICByZXR1cm4gXCJeXCIgKyBzdHJpbmdXaXRoRXNjYXBlZFNlcGFyYXRvcnMgKyBcIiRcIjtcbiAgfVxufTtcbiIsIi8vIENoZWNrIGlmIEdETUhhbmRsZXIgc2hvdWxkIGJlIGNhbGxlZC4gXG5cbnZhciB0eXBlID0gcmVxdWlyZSggJy4vdXRpbHMvdHlwZScgKSwgXG4gICAgbG9nID0gcmVxdWlyZSgnYm93cycpKCdHRE0gSGFuZGxlcicpO1xuXG5cbi8vIEEgc2ltcGxlIGZ1bmN0aW9uIGZvciBsYXVuY2hpbmcgdGhlIEdETSBzY3JpcHRcbmZ1bmN0aW9uIGxhdW5jaEdETSgpIHtcbiAgbG9nKCdMYXVuY2hpbmcgR0RNIFNjcmlwdCcpO1xuICAoZnVuY3Rpb24oYSkgeyB2YXIgZCA9IGRvY3VtZW50LGMgPSBkLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7Yy5hc3luYyA9ICEwLCBjLmRlZmVyID0gITAsIGMuc3JjID0gYSwgZC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF0uYXBwZW5kQ2hpbGQoYyl9KSgoaWF0RGV2ID0gKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoXCJpYXREZXY9MVwiKSA+IC0xIHx8IGRvY3VtZW50LmNvb2tpZS5pbmRleE9mKFwiaWF0RGV2PTFcIikgPiAtMSksIFwiLy9cIiArICh3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgPT0gXCJodHRwOlwiICYmICFpYXREZXYgPyBcImhcIiA6IFwiXCIpICsgXCJmcC5nZG1kaWdpdGFsLmNvbS9cIiArIGZsZXhJZCArIFwiLmpzP3I9XCIgKyBNYXRoLnJhbmRvbSgpICogMWUxNiArICcmbT05OTImYT0nICsgZmxleElkICsgKGlhdERldiA/IFwiJmQ9MVwiIDogXCJcIikpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHN0YXJ0OiBmdW5jdGlvbihjb25maWcpIHtcbiAgICBpZiAoICF0eXBlKGNvbmZpZywgJ29iamVjdCcpICkgcmV0dXJuO1xuICAgIGlmIChjb25maWcuZXhjbHVkZSkgcmV0dXJuO1xuICAgIFxuICAgIGxhdW5jaEdETShjb25maWcuZmxleElkKTtcbiAgfVxufTsgIiwiLypcbiAqIFNldCB1cCBhbGwgdGhlIHRhZ3MgYW5kIHBpeGVscyBmb3IgVmVHZW5pZSB0byB3b3JrIHByb3Blcmx5LiBcbiAqL1xuXG52YXIgc3RvcmUgPSByZXF1aXJlKCdzdG9yZScpLFxuICAgIG5hbWVzcGFjZSA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKS5uYW1lc3BhY2UsXG4gICAgdXJsQ2hlY2sgPSByZXF1aXJlKCcuL3V0aWxzL3VybHMnKSxcbiAgICBjaGVja0VsZW1lbnQgPSByZXF1aXJlKCcuL3V0aWxzL2NoZWNrRWxlbWVudHMnKSxcbiAgICBhZGRQaXhlbCA9IHJlcXVpcmUoJy4vdXRpbHMvYWRkUGl4ZWwnKSxcbiAgICAkID0gd2luZG93LlZFalF1ZXJ5LFxuICAgIGxvZyA9IHJlcXVpcmUoJ2Jvd3MnKSgnR2VuaWUgSGFuZGxlcicpLFxuICAgIGxvZ09WID0gcmVxdWlyZSgnYm93cycpKCdPcmRlciBWYWx1ZScpO1xuXG5cbnZhciBPUkRFUlZBTFVFID0gJ29yZGVyVmFsdWUnO1xuXG4vLyBDcml0ZXJpYSBmb3IgdGhlIGR5bmFtaWMgaWRlbnRpZmllcnMgb2Ygd2hpY2ggcGFnZSBpcyBhIGNvbXBsZXRlIHBhZ2UuXG52YXIgY3JpdGVyaWEgPSB7XG4gIFxuICBjb250YWluczogZnVuY3Rpb24oJGVsLCB2YWx1ZSkge1xuICAgIHJldHVybiAkZWwudGV4dCgpLmluZGV4T2YoU3RyaW5nKHZhbHVlKSkgIT09IC0xO1xuICB9LFxuICBcbiAgZXF1YWw6IGZ1bmN0aW9uKCRlbCwgdmFsdWUpIHtcbiAgICByZXR1cm4gJGVsLnRleHQoKSA9PT0gU3RyaW5nKHZhbHVlKTtcbiAgfSxcbiAgXG4gIG5vdDogZnVuY3Rpb24oJGVsLCB2YWx1ZSkge1xuICAgIHJldHVybiAkZWwudGV4dCgpLmluZGV4T2YoU3RyaW5nKHZhbHVlKSkgPT09IC0xO1xuICB9XG4gIFxufTtcblxudmFyIG1hc2tzID0ge1xuICBcbiAgbnVtYmVyOiBmdW5jdGlvbiggc3RyICkge1xuICAgIHN0ciA9IFN0cmluZyhzdHIpO1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvW14wLTldL2csICcnKTtcbiAgfSxcbiAgXG4gIGFscGhhbnVtZXJpYzogZnVuY3Rpb24oIHN0ciApIHtcbiAgICAvLyBUT0RPOiBpbXBsZW1lbnQgc29tdGhpbmdzIGF3ZW9zbWUuIFtBLVowLTldXG4gIH1cbn07XG5cblxuXG5mdW5jdGlvbiBjcmVhdGVDb21wbGV0ZVBhZ2VQaXhlbChjb25maWcpIHtcbiAgdmFyIHNyYyxcbiAgICAgIG9yZGVyVmFsdWUgPSBnZXRPcmRlclZhbHVlKCksXG4gICAgICBvcmRlcklkID0gZ2V0T3JkZXJJZChjb25maWcub3JkZXJJZCksXG4gICAgICBjb21wbGV0aW9uSWQgPSBjb25maWcuY29tcGxldGlvbklkO1xuICBzcmMgPSAnaHR0cHM6Ly9zZWN1cmUuYWRueHMuY29tL3B4P2lkPScgKyBjb21wbGV0aW9uSWQgKyAnJm9yZGVyX2lkPScgK1xuICAgIG9yZGVySWQgKyAnJnZhbHVlPScgKyBvcmRlclZhbHVlICsgJyZ0PTInO1xuICBcbiAgYWRkUGl4ZWwoc3JjKTtcbiAgbG9nKCdQaXhlbCBBZGRlZCB0byBjb21wbGV0ZSBwYWdlJylcbn1cblxuICBcbmZ1bmN0aW9uIGNvbXBsZXRlUGFnZShjb25maWcpIHtcbiAgdmFyIG1hdGNoID0gZmFsc2UsXG4gICAgICBkeW5hbWljSWQgPSBjb25maWcuY29tcGxldGVQYWdlLmR5bmFtaWNJZGVudGlmaWVyO1xuICBcbiAgLy8gZHluYW1pY2FsbHkgY2hlY2sgZm9yIGNoZWNrb3V0IHBhZ2VcbiAgaWYgKGR5bmFtaWNJZC5zZWxlY3Rvci5sZW5ndGgpIHtcbiAgICBjaGVja0VsZW1lbnQuY2hlY2soc2VsZWN0b3IsIGZ1bmN0aW9uKCRlbCkge1xuICAgICAgaWYgKGR5bmFtaWNJZC5jcml0ZXJpYS5sZW5ndGggJiYgZHluYW1pY0lkLnZhbHVlLmxlbmd0aCAmJlxuICAgICAgICAgIGNyaXRlcmlhW2R5bmFtaWNJZC5jcml0ZXJpYV0oJGVsLCBkeW5hbWljSWQudmFsdWUpKSB7XG4gICAgICAgIGNyZWF0ZUNvbXBsZXRlUGFnZVBpeGVsKGNvbmZpZyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgXG4gICQuZWFjaChjb25maWcuY29tcGxldGVQYWdlLnVybHMsIGZ1bmN0aW9uKGluZGV4LCB1cmwpIHtcbiAgICBpZih1cmxDaGVjay50ZXN0KHVybCwgY29uZmlnLmNvbXBsZXRlUGFnZS5wYXJhbXMpKSB7XG4gICAgICBtYXRjaCA9IHRydWU7XG4gICAgfVxuICB9KTtcbiAgXG4gIGlmICggbWF0Y2ggKSB7IC8vIHdlIGFyZSBvbiBhIGNvbXBsZXRlIHBhZ2VcbiAgICBjcmVhdGVDb21wbGV0ZVBhZ2VQaXhlbChjb25maWcpO1xuICB9XG59XG5cbi8vIE9yZGVyVmFsdWUgUGFnZSBncmFiIG9yZGVyIFZhbHVlIGFuZCBhZGQgdG8gbG9jYWwgc3RvcmFnZVxuXG5mdW5jdGlvbiBvcmRlclZhbHVlUGFnZShjb25maWcpIHtcbiAgJC5lYWNoKGNvbmZpZy5jb21wbGV0ZVBhZ2UudXJscywgZnVuY3Rpb24oaW5kZXgsIHVybCkge1xuICAgIGlmKHVybENoZWNrLnRlc3QodXJsLCBjb25maWcuY29tcGxldGVQYWdlLnBhcmFtcykpIHtcbiAgICAgIG1hdGNoID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuICBcbiAgaWYoIG1hdGNoICkge1xuICAgIGxvZ09WKCdXZSBhcmUgb24gdGhlIE9yZGVyIFZhbHVlIFBhZ2UnKTtcbiAgICBjaGVja0Zvck9yZGVyVmFsdWVTZWxlY3Rvcihjb25maWcub3JkZXJWYWx1ZSk7XG4gIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3RhcnQ6IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgIFxuICAgIC8vIEFyZSB3ZSBvbiB0aGUgY29tcGxldGUgcGFnZT9cbiAgICBjb21wbGV0ZVBhZ2UoY29uZmlnKTtcbiAgICBcbiAgICAvLyBBcmUgd2Ugb24gdGhlIG9yZGVyIHZhbHVlIHBhZ2U/XG4gICAgb3JkZXJWYWx1ZVBhZ2UoY29uZmlnKTtcbiAgfVxufTtcblxuXG5mdW5jdGlvbiBnZXRPcmRlcklkIChvcmRlcklkT2JqZWN0KSB7XG4gIHZhciAkZWwgPSAkKG9yZGVySWRPYmplY3Quc2VsZWN0b3IpO1xuICByZXR1cm4gJGVsLnRleHQoKS5yZXBsYWNlKG9yZGVySWRPYmplY3QucmVnZXgsICcnKSB8fCAkZWwudmFsKCkucmVwbGFjZShvcmRlcklkT2JqZWN0LnJlZ2V4LCAnJyk7XG59XG5cblxuZnVuY3Rpb24gY2hlY2tGb3JPcmRlclZhbHVlU2VsZWN0b3Iob3JkZXJWYWx1ZU9iamVjdCkge1xuICBsb2dPVignQ2hlY2tpbmcgRm9yIE9yZGVyIFZhbHVlJyk7XG4gIFxuICBjaGVja0VsZW1lbnQuY2hlY2soIG9yZGVyVmFsdWVPYmplY3Quc2VsZWN0b3IsIGZ1bmN0aW9uKCRlbCkge1xuICAgIGxvZ09WKCdPcmRlciBWYWx1ZSBlbGVtZW50IGZvdW5kJyk7XG4gICAgdmFyIHZhbCA9ICRlbC52YWwoKS5yZXBsYWNlKG9yZGVySWRPYmplY3QucmVnZXgsICcnKSB8fFxuICAgICAgICAkZWwudGV4dCgpLnJlcGxhY2Uob3JkZXJWYWx1ZU9iamVjdC5yZWdleCwgJycpIHx8XG4gICAgICAgIFN0cmluZyhvcmRlclZhbHVlT2JqZWN0LmRlZmF1bHQpO1xuICAgIHN0b3JlT3JkZXJWYWx1ZSh2YWwpO1xuICB9KTtcbn1cblxuXG5mdW5jdGlvbiBzdG9yZU9yZGVyVmFsdWUodmFsKSB7XG4gIGxvZ09WKCdTdG9yaW5nIE9yZGVyIFZhbHVlJyk7XG4gIHN0b3JlLnNldChuYW1lc3BhY2UrT1JERVJWQUxVRSwgdmFsKTtcbn1cblxuXG5mdW5jdGlvbiBnZXRPcmRlclZhbHVlKCkge1xuICBsb2dPVignT2J0YWluaW5nIE9yZGVyIFZhbHVlJyk7XG4gIHN0b3JlLmdldChuYW1lc3BhY2UgKyBPUkRFUlZBTFVFKTtcbn0iLCIvKlxuICpcbiAqIFRoaXMgbW9kdWxlIGlzIHdoYXQgZGV0ZXJtaW5lIHRoZSBzZXR0aW5nc1xuICogZm9yIGVhY2ggbW9kdWxlIHVzZWQgaW4gdGhlIGFwcGxpY2F0aW9uLlxuICovXG5cbnZhciByYXdTZXR0aW5ncyA9IHdpbmRvdy52ZVRhZ0RhdGEuc2V0dGluZ3MuZ2RtO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2RtOiB7XG4gICAgZXhjbHVkZTogcmF3U2V0dGluZ3MuZXhjbHVkZSxcbiAgICBmbGV4SWQ6IHJhd1NldHRpbmdzLmZsZXhJZFxuICB9LFxuICBnZW5pZToge1xuICAgIGNvbXBsZXRpb25JZDogcmF3U2V0dGluZ3MuY29tcGxldGlvbklkLFxuICAgIGpvdXJuZXlDb2RlOiByYXdTZXR0aW5ncy5qb3VybmV5Q29kZSxcbiAgICBzZWdtZW50SWRzOiByYXdTZXR0aW5ncy5zZWdtZW50SWRzLFxuICAgIG9yZGVySWQ6IHJhd1NldHRpbmdzLm9yZGVySWQsXG4gICAgb3JkZXJWYWx1ZTogcmF3U2V0dGluZ3Mub3JkZXJWYWx1ZSxcbiAgICBjb21wbGV0ZVBhZ2U6IHJhd1NldHRpbmdzLmNvbXBsZXRlUGFnZSxcbiAgfSxcbiAgbmFtZXNwYWNlOiAndmVhcHBzLicgKyByYXdTZXR0aW5ncy5mbGV4SWQgKyAnLkdETS4nXG59OyIsIi8vIEFkZCBhIHBpeGVsIHRvIHRoZSBwYWdlLiBcbi8vIFxuXG5mdW5jdGlvbiBhcHBlbmRQaXhlbCggcGl4ZWxQYXRoICkge1xuICB2YXIgcGl4ZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgcGl4ZWwud2lkdGggPSAxO1xuICBwaXhlbC5oZWlnaHQgPSAxO1xuICBwaXhlbC5zcmMgPSBwaXhlbFBhdGg7XG4gIHBpeGVsLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChwaXhlbCk7XG4gIFxuICAvLyBUbyBmaXggYSBidWcgd2hlcmUgdGhlIHBpeGVsIHNvbWV0aW1lcyBhZGRzIHBhZGRpbmcgb24gY2VydGFpbiBwYWdlc1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIHBpeGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIH0sIDEwMDApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcGVuZFBpeGVsOyIsIi8vIENoZWNrIHRvIHNlZSBpZiBlbGVtZW50IGV4aXN0cyBpZiBub3Qga2VlcCBjaGVja2luZyBldmVyeSBzZWNvbmQgdW50aWwgaXQgaXMgZm91bmQuIFxudmFyIGxvZyA9IHJlcXVpcmUoJ2Jvd3MnKSgnQ2hlY2sgRWxlbWVudHMnKTtcbnZhciAkID0gVkVqUXVlcnk7XG5cbmZ1bmN0aW9uIGludGVydmFsKG1zLCBtYXhSZXRyaWVzLCBmbikge1xuICB2YXIgcnVuVGltZXMgPSAwO1xuICBtcyA9IG1zIHx8IDEwMDA7XG4gIG1heFJldHJpZXMgPSBtYXhSZXRyaWVzIHx8IDYwMDsgLy8gMTAgbWluIGRlZmF1bHRcbiAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0b3AgPSBmbigpO1xuICAgIHJ1blRpbWVzKys7XG4gICAgaWYoc3RvcCB8fCAobWF4UmV0cmllcyAmJiBydW5UaW1lcyA+PSBtYXhSZXRyaWVzKSkge1xuICAgICAgbG9nKCdDbGVhcmluZyBDaGVjayBJbnRlcnZhbCcpO1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgfVxuICB9LCBtcyk7XG4gIHJldHVybiBpbnRlcnZhbDsgLy8gYWxsb3cgdGhlIGludGVydmFsIHRvIGJlIGNsZWFyZWQ7XG59XG5cbmZ1bmN0aW9uIGNoZWNrRWxlbWVudCAoc2VsZWN0b3IsIHN1Y2Nlc3NGbikge1xuICAvLyB3aGVuIHN1Y2Nlc3NmdWwgY2FsbCB0aGUgc3VjY2VzcyBmdW5jdGlvbi4gXG4gIHZhciB0cmllcyA9IGludGVydmFsKG51bGwsIG51bGwsIGZ1bmN0aW9uKCl7XG4gICAgdmFyICRlbCA9ICQoc2VsZWN0b3IpO1xuICAgIGlmICgkZWwubGVuZ3RoKSB7XG4gICAgICBsb2coJ1N1Y2Nlc3MgZnVuY3Rpb24gaXMgYWJvdXQgdG8gYmUgY2FsbGVkJyk7XG4gICAgICBjbGVhckludGVydmFsKHRyaWVzKTtcbiAgICAgIHN1Y2Nlc3NGbigkZWwpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBcbiAgY2hlY2s6IGZ1bmN0aW9uKCBzZWxlY3Rvciwgc3VjY2Vzc0ZuICkge1xuICAgIGxvZygnRWxlbWVudCBpcyBiZWluZyBjaGVja2VkJyk7XG4gICAgY2hlY2tFbGVtZW50KHNlbGVjdG9yLCBzdWNjZXNzRm4pO1xuICB9XG4gIFxufTsiLCIvKipcbiAqIHRvU3RyaW5nIHJlZi5cbiAqL1xudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbi8qKlxuICogUmV0dXJuIHRoZSB0eXBlIG9mIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsLCB0ZXN0VHlwZSkge1xuICBzd2l0Y2godG9TdHJpbmcuY2FsbCh2YWwpKSB7XG4gICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICByZXR1cm4gdGVzdFR5cGUgPT09ICdkYXRlJztcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgcmV0dXJuIHRlc3RUeXBlID09PSAncmVnZXhwJztcbiAgICBjYXNlICdbb2JqZWN0IEFyZ3VtZW50c10nOlxuICAgICAgcmV0dXJuIHRlc3RUeXBlID09PSAnYXJndW1lbnRzJztcbiAgICBjYXNlICdbb2JqZWN0IEFycmF5XSc6XG4gICAgICByZXR1cm4gdGVzdFR5cGUgPT09ICdhcnJheSc7XG4gICAgY2FzZSAnW29iamVjdCBFcnJvcl0nOlxuICAgICAgcmV0dXJuIHRlc3RUeXBlID09PSAnZXJyb3InO1xuICB9XG4gIGlmKHZhbCA9PT0gbnVsbCkgcmV0dXJuIHRlc3RUeXBlID09PSAnbnVsbCc7XG4gIGlmKHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdGVzdFR5cGUgPT09ICd1bmRlZmluZWQnO1xuICBpZih2YWwgIT09IHZhbCkgcmV0dXJuICduYW4nO1xuICBpZih2YWwgJiYgdmFsLm5vZGVUeXBlID09PSAxKSByZXR1cm4gdGVzdFR5cGUgPT09ICdlbGVtZW50JztcbiAgdmFsID0gdmFsLnZhbHVlT2YgPyB2YWwudmFsdWVPZigpIDogT2JqZWN0LnByb3RvdHlwZS52YWx1ZU9mLmFwcGx5KHZhbClcbiAgcmV0dXJuIHRlc3RUeXBlID09PSB0eXBlb2YgdmFsO1xufTsiLCJ2YXIgdXJsUGF0dGVybiA9IHJlcXVpcmUoJ3VybC1wYXR0ZXJuJyksXG4gICAgbG9nID0gcmVxdWlyZSgnYm93cycpKCdVUkwgVGVzdHMnKSxcbiAgICAkID0gd2luZG93LlZFalF1ZXJ5O1xuXG5cbnZhciBQQUdFX1VSTCA9IGNsZWFuVXJsKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSksXG4gICAgUEFHRV9QQVJBTVMgPSBjb252ZXJ0U2VhcmNoVG9PYmplY3Qod2luZG93LmxvY2F0aW9uLnNlYXJjaCB8fCAnJyk7XG5sb2coJ1BBR0VfVVJMIGFuZCBQQUdFX1BBUkFNUyBoYXZlIGJlZW4gc2V0LicpXG5cbmZ1bmN0aW9uIGNvbnZlcnRTZWFyY2hUb09iamVjdChzZWFyY2hTdHJpbmcpIHtcbiAgdmFyIHF1ZXJpZXMsIGlpLCBzZWFyY2hPYmplY3QsIHNwbGl0O1xuICBxdWVyaWVzID0gc2VhcmNoU3RyaW5nLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpLnNwbGl0KCcmJyk7XG4gIGZvcihpaSA9IDA7IGlpIDwgcXVlcmllcy5sZW5ndGg7IGlpKyspIHtcbiAgICBzcGxpdCA9IHF1ZXJpZXNbaWldLnNwbGl0KCc9Jyk7XG4gICAgc2VhcmNoT2JqZWN0W3NwbGl0WzBdXSA9IHNwbGl0WzFdO1xuICB9XG4gIHJldHVybiBzZWFyY2hPYmplY3Q7XG59XG5cblxuZnVuY3Rpb24gY2xlYW5VcmwoZGlydHlVUkwpIHtcbiAgdHJ5IHtcbiAgICB2YXIgdXJsID0gbmV3IFN0cmluZyhkaXJ0eVVSTCkudG9Mb3dlckNhc2UoKTtcbiAgICB1cmwgPSB1cmwucmVwbGFjZShcImh0dHA6Ly9cIiwgXCJcIik7XG4gICAgdXJsID0gdXJsLnJlcGxhY2UoXCJodHRwczovL1wiLCBcIlwiKTtcbiAgICB1cmwgPSB1cmwucmVwbGFjZShcIiNcIiwgXCI/XCIpO1xuICAgIHVybCA9IHVybC5yZXBsYWNlKFwiO1wiLCBcIj9cIik7XG4gICAgaWYoIHVybC5zdWJzdHIoMCwgNCkgPT09ICd3d3cuJyApIHtcbiAgICAgIHVybCA9IHVybC5yZXBsYWNlKCd3d3cuJywgJycpO1xuICAgIH1cbiAgICByZXR1cm4gdXJsO1xuICB9IGNhdGNoKGVycikge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGNoZWNrVVJMTWF0Y2hlcyh0ZXN0UGF0dGVybikge1xuICBpZih0ZXN0UGF0dGVybi5zdWJzdHIoMCwgNCkgPT09ICd3d3cuJykge1xuICAgIHRlc3RQYXR0ZXJuID0gdGVzdFBhdHRlcm4ucmVwbGFjZSgnd3d3LicsICcnKTtcbiAgfVxuICB2YXIgcGF0dGVybiA9IHVybFBhdHRlcm4ubmV3UGF0dGVybih0ZXN0UGF0dGVybik7XG4gIHJldHVybiAhIXBhdHRlcm4ubWF0Y2goUEFHRV9VUkwpO1xuICBsb2coICdSZXN1bHQgb2YgVVJMcyBtYXRjaGluZyBpcycsIG1hdGNoKTtcbn1cblxuXG5mdW5jdGlvbiBjaGVja1BhcmFtc01hdGNoKHBhcmFtcykge1xuICB2YXIgbWF0Y2ggPSB0cnVlO1xuICBpZighcGFyYW1zLmxlbmd0aCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIC8vIGxvb3AgdGhyb3VnaCB0aGUgcGFyYW1zIGFuZCBtYWtlIHN1cmUgdGhleSBhcmUgaW4gdGhlIHBhZ2VQYXJhbXNcbiAgLy8gZm9yIChrZXkgaW4gcGFnZVBhcmFtcylcbiAgLy8gVE9ETzogQWRkIHN1cHBvcnQgZm9yIHNwbGF0cyBbRE9ORV1cbiAgJC5lYWNoKHBhcmFtcywgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgIGtleSA9IHN0cmluZyhrZXkpO1xuICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKTtcbiAgICB2YXIgcGF0dGVybiA9IHVybFBhdHRlcm4ubmV3UGF0dGVybih2YWx1ZSk7XG4gICAgaWYoIShwYXR0ZXJuLm1hdGNoKFBBR0VfUEFSQU1TW2tleV0pIHx8IHBhdHRlcm4ubWF0Y2goZGVjb2RlVVJJQ29tcG9uZW50KFBBR0VfUEFSQU1TW2tleV0pKSkpIHtcbiAgICAgIG1hdGNoID0gZmFsc2U7XG4gICAgfVxuICB9KTtcbiAgbG9nKCAnUmVzdWx0IG9mIHBhcmFtZXRlcnMgbWF0Y2hpbmcgaXMnLCBtYXRjaCApO1xuICByZXR1cm4gbWF0Y2g7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBcbiAgdGVzdDogZnVuY3Rpb24ocGF0dGVybiwgcGFyYW1zKSB7XG4gICAgcmV0dXJuIGNoZWNrVVJMTWF0Y2hlcyhwYXR0ZXJuKSAmJiBjaGVja1BhcmFtc01hdGNoKHBhcmFtcyk7XG4gIH1cbiAgXG59OyJdfQ==
