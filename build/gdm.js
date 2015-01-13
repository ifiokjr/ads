(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Load Polyfills
var log = require('debug')('General');
try {
  require('./utils/polyfills');

  var settings = require('./settings'),
      gdmHandler = require('./gdmhandler'),
      genieHandler = require('./geniehandler');
  log('Entering the application');
  // Firstly lets run the gdm handler. 
  gdmHandler.start(settings.gdm);


  // Now we run the Genie specific tags. 
  genieHandler.start(settings.genie);
} catch(e) {
}
},{"./gdmhandler":7,"./geniehandler":8,"./settings":9,"./utils/polyfills":15,"debug":2}],2:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Use chrome.storage.local if we are in an app
 */

var storage;

if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined')
  storage = chrome.storage.local;
else
  storage = window.localStorage;

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      storage.removeItem('debug');
    } else {
      storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

},{"./debug":3}],3:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":4}],4:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 's':
      return n * s;
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
// Check if GDMHandler should be called. 
var type = require('./utils/type'),
  log = require('debug')('GDM Handler');
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
},{"./utils/type":17,"debug":2}],8:[function(require,module,exports){
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
    log = require('debug')('Genie Conversion Pixel'),
    type = require('./utils/type'),
    logOV = require('debug')('Genie Order Value');
    logPP = require('debug')('Product Page');


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
      orderId = getVal(config.orderId) || (new Date()).getTime(),
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
  var srcIb, srcSecure, genieSrc,
      productId = getVal(config.productPages),
      journeyCode = config.journeyCode;
  
  srcIb = pixelSrc.ros(config. segmentIds);
  srcSecure = pixelSrc.ros(config.segmentIds, true);
  
  addPixel(srcIb);
  addPixel(srcSecure);
  
  var params = {
      adgCompanyID: journeyCode,
      adgItem: productId
    };
  
  
  genieSrc = pixelSrc.adgenie(params, false) ;
  logPP('Genie Src is', genieSrc);
  addPixel(genieSrc);
  logPP('Product Page Pixel added to the site.');
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
  
  match = checkCurrentPage(config.completePage.page.urls, config.completePage.page.params);
  
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
    log('We are on a Product Page');
    buildProductPagePixel( config );
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
    
    product = productPages(config);
    
    if ( !complete && !basket && !product ) { rosPages(config); }
  }
};



function regexReplacementFromElement( $el, regex, fallback, lastResort ) {
  regex = type(regex, 'regexp') ? regex : new RegExp('', 'g');
  return ($el.text() && $el.text().replace(regex, '')) ||
      ($el.val() && $el.val().replace(regex, '')) ||
      String( fallback || lastResort );
}


/*
 * Obtain the falue from the current page if this is the relevant page.
 */
function getVal (obj, fallback) {
  var $el = $(obj.selector),
      timestamp = (new Date()).getTime();
  
  if (!$el.length) { return obj['default'] || timestamp; }
  
  var val = regexReplacementFromElement( $el, obj.regex, obj, timestamp);
     
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


// If order value should be called from the complete page - then run this instead. 
function orderValueOnCompletePage(orderValueObject) {}

function getOrderValue(orderValueObject) {
  logOV('Obtaining Order Value');
  return store.get(namespace + ORDERVALUE);
}
},{"./settings":9,"./utils/addPixel":10,"./utils/checkElements":11,"./utils/criteria":12,"./utils/pixelSrc":14,"./utils/store":16,"./utils/type":17,"./utils/urls":18,"debug":2}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
// Check to see if element exists if not keep checking every second until it is found. 
var log = require('debug')('Checking Elements'),
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
},{"./type":17,"debug":2}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
/*
 * Deprecated for debug
 */

var type = require('./type');

function log(message, obj1, obj2) {
  if(veTagData.settings.consoleMessagesEnabled && !type(console, 'undefined')) {
    console.info(message, (obj1 || ''), (obj2 || ''));
  }
}

function safe(message, obj1, obj2) {
  if(veTagData.settings.consoleMessagesEnabled && !type(console, 'undefined')) {
    console.log(message, (obj1 || ''), (obj2 || ''));
  }
}

module.exports = log;
module.exports.safe = safe;
},{"./type":17}],14:[function(require,module,exports){
/**
 * This is a file for automatically generating the relevant pixels for our code.
 */
var SECURE = (window.location.protocol || 'https:') === 'https:' ? true : false,
    $ = window.VEjQuery,
    type = require('./type'),
    log = require('./log');


module.exports = {
  ros: function(segmentIds, secure) {
    if(secure) {
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
      
    });
    
    return startString;
  }
};
},{"./log":13,"./type":17}],15:[function(require,module,exports){
var type = require('./type');

// Object.create 
if (!type(Object.create, 'function')) {
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


// Allow for obtaining object size from any object 
if(!type(Object.size, 'function')) {
  Object.size = function(obj) {
    var size = 0,
      key;
    for(key in obj) {
      if(obj.hasOwnProperty(key)) {size++;}
    }
    return size;
  };
}

// forEach
// http://javascript.boxsheep.com/polyfills/Array-prototype-forEach/
if(!Array.prototype.forEach) {
  Array.prototype.forEach = function(callbackfn, thisArg) {
    var O = Object(this),
      lenValue = O.length,
      len = lenValue >>> 0,
      T,
      k,
      Pk,
      kPresent,
      kValue;
    if(typeof callbackfn !== 'function') {
      throw new TypeError();
    }
    T = thisArg ? thisArg : undefined;
    k = 0;
    while(k < len) {
      Pk = k.toString();
      kPresent = O.hasOwnProperty(Pk);
      if(kPresent) {
        kValue = O[Pk];
        callbackfn.call(T, kValue, k, O);
      }
      k += 1;
    }
    return undefined;
  };
}


// Avoid Logging To Console where not available. 
// http://perrymitchell.net/article/ie8_javascript_console/
(function() {
  var method;
  var noop = function() {};
  var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception',
                 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline',
                 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
  var length = methods.length;
  var console = (window.console = window.console || {});
  while(length--) {
    method = methods[length];
    // Only stub undefined methods.
    if(!console[method]) {
      console[method] = noop;
    }
  }
  
  // provides IE9 support 
  if (Function.prototype.bind && type(console, 'object') && type(console.log, 'object')) {
    methods.forEach(function(meth, idx) {
      console[method] = Function.prototype.call.bind(console[method], console);
    });
  }
}());

// indexOf
// http://perrymitchell.net/article/ie8_javascript_indexof_hasownproperty/
if(!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement /*, fromIndex */ ) {
    'use strict';
    if(this == null) {
      throw new TypeError();
    }
    var t = Object(this);
    var len = t.length >>> 0;
    if(len === 0) {
      return -1;
    }
    var n = 0;
    if(arguments.length > 1) {
      n = Number(arguments[1]);
      if(n !== n) { // shortcut for verifying if it's NaN
        n = 0;
      } else if(n !== 0 && n !== Infinity && n !== -Infinity) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }
    if(n >= len) {
      return -1;
    }
    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
    for(; k < len; k++) {
      if(k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  };
}
},{"./type":17}],16:[function(require,module,exports){
/**
 * Created with GDM.
 * User: ifiokjr
 * Date: 2015-01-06
 * Time: 09:47 AM
 * 
 * This file checks which methods to use for local storage. 
 */
var store, storage,
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

var STORAGE_SUPPORTED; // = supportStorage(method);

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



if(type(JSON.parse, 'function') && type(JSON.stringify, 'function')) {
  store = require('store');
  storage = store.enabled ? store : noStorage;
} else {
  storage = (STORAGE_SUPPORTED || (STORAGE_SUPPORTED = supportStorage(method))) ? simpleStorage : noStorage;
}


module.exports = storage;
},{"./type":17,"store":5}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
var urlPattern = require('url-pattern'),
    log = require('debug')('URLs'),
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
    var url = (dirtyURL + '').toLowerCase();
    url = url.replace('http://', '');
    url = url.replace('https://', '');
    url = url.replace('#', '?');
    url = url.replace(';', '?');
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
  var match = !!pattern.match(PAGE_URL);
  log( 'Result of URLs matching ' + testPattern + ' is', match );
  return match;
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
},{"debug":2,"url-pattern":6}]},{},[1]);
