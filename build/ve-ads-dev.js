(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

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
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
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
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":2}],2:[function(require,module,exports){

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

},{"ms":3}],3:[function(require,module,exports){
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
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
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

},{}],4:[function(require,module,exports){
'use strict';

/**
 * @module `common/criteria`
 */

var type = require('./utils').type,
    criteria;


/**
 * @exports criteria object
 */

module.exports = criteria = {


  /**
   * Always returns true. A check that will always match.
   *
   * @return {Boolean} Always true.
   */

  always: function ( ) {
    return true;
  },


  /**
   * Checks that the passed string is equal to the passed value.
   *
   * @param  {String} str   - passed string
   * @param  {String} value - value to test against
   * @param  {Boolean} caseSensitive - don't ignore the case if true
   *
   * @return {Boolean}
   */

  equal: function( str, value, caseSensitive ) {
    str = String( str );
    value = String( value );

    if ( !caseSensitive ) {
      str = str.toLowerCase( );
      value = value.toLowerCase( );
    }

    return str === value;
  },

  /**
   * Checks that the passed string is NOT equal to the passed value.
   *
   * @param  {String} str   - passed string
   * @param  {String} value - value to test against
   * @param  {Boolean} caseSensitive - don't ignore the case if true
   *
   * @return {Boolean}
   */

  notEqual: function( str, value, caseSensitive ) {
    return !criteria.equal( str, value, caseSensitive );
  },



  /**
   * Checks that the passed string is within the passed value.
   *
   * @param  {String} str   - passed string
   * @param  {String} value - value to test against
   * @param  {Boolean} caseSensitive - don't ignore the case if true
   *
   * @return {Boolean}
   */

  contains: function( str, value, caseSensitive ) {
    str = String( str );
    value = String( value );

    if ( !caseSensitive ) {
      str = str.toLowerCase( );
      value = value.toLowerCase( );
    }

    return value.indexOf( str ) > -1;
  },


  /**
   * Checks that the passed string is **NOT** within the passed value.
   *
   * @param  {String} str   - passed string
   * @param  {String} value - value to test against
   * @param  {Boolean} caseSensitive - don't ignore the case if true
   *
   * @return {Boolean}
   */

  notContains: function( str, value, caseSensitive ) {
    return !criteria.contains( str, value, caseSensitive );
  }

};

},{"./utils":11}],5:[function(require,module,exports){
'use strict';

/**
 * Module for including logging statements to the console.
 */

var nestedNoop = function() {
  return function () {};
};


if ( window.debugVeAds && window.debugVeAds.enable ) {
  window.debugVeAds.enable('*');
}

/**
 * Exports debugVeAds object if it exists (has been injected into the DOM via a plugin);
 *
 * @type {[type]}
 */

module.exports = window.debugVeAds || nestedNoop;

},{}],6:[function(require,module,exports){
'use strict';

/**
 * @module common/elements
 *
 * Functions for looking up elements in the dom (utilises jQuery broken
 * promise implementation - beware).
 */

var settings = require( '../settings' ),
    $ = require( './jq' ),
    utils = require( './utils' ),
    log = require( './debug' )('ve:elements');

var elements;


/**
 * Expose `elements` object.
 */

module.exports = elements = {
  
  instantCheck: instantCheck,

  dynamicCheck: dynamicCheck,

  progressCheck: progressCheck,

  obtainValue: obtainValue,

  obtainValues: obtainValues

};


/**
 * @api public
 *
 * Check for element value, and fallback to element text.
 *
 * @param {jQueryElement} $el - Element to check.
 *
 * @returns {String} - The value obtained from this element.
 */

function obtainValue( $el ) {
  if ( !utils.type($el, 'jquery') ) { $el = $( $el ); }


  if ( !$el.length ) { return ''; }

  $el = $el.first(); // only return value for the first object found from selector.

  if ( $el.val( ) ) {
    return $.trim( $el.val( ) );
  } else {
    return $.trim( $el.text( ) );
  }
}


/**
 * Returns an array of values for each element that has been found.
 * @param  {jQueryElement} $el - Element from which to extract values
 * @return {[type]}     [description]
 */
function obtainValues( $el ) {
  var values = [];
//   window.REMOVEME = $el;

  $el.each( function( index, el ) {
    var value = obtainValue( $(el) );
    values.push( $.trim(value) );
  });
  return values;
}


/**
 * @api private
 *
 * This function provides the interval that is used to create our promises
 * Defaults are taken from the settings object
 *
 * @param {Function} cb - the callback to be run on each interval.
 *
 * @returns {Number} - the interval id so it can be cleared
 */

function interval( cb ) {
  var runTimes, ms, maxRetries;

  runTimes = 0;
  ms = settings.ELEMENT_MS;
  maxRetries = settings.ELEMENT_MAX_RETRIES;

  var calledInterval = setInterval( function() {
    var stopRunning = cb( );
    runTimes++;
    if ( stopRunning || (maxRetries && (runTimes >= maxRetries)) ) {
      clearInterval( calledInterval );
    }
  }, ms );

 return calledInterval; // allow the interval to be cleared;
}


/**
 * @api public
 *
 * Immediately check for the existense of the selector and return.
 *
 * @param {String} selector - used to generate a jQuery object
 *
 * @returns {jQueryObject} - an element to be returned by the receiver
 */

 function instantCheck( selector ) {
   return $( selector );
 }


/**
 * @api public
 *
 * Immediately check for the existense of the selector and return.
 *
 * @param {String} selector - the string used to check for element presence
 *
 * @returns {jQueryPromise} -  promise resolved as soon as element is found
 */

function dynamicCheck( selector ) {
  var $el = instantCheck( selector ),
      deferred = $.Deferred( );

  if( $el.length ) { // avoid intervals where not needed.
    deferred.resolve( $el );
  }

  interval( function( ) {
    $el = instantCheck( selector );

    if ( $el.length ) {
      deferred.resolve( $el ); // Promise should now be resolved
      return true;
    }
    return false;
  });

  return deferred.promise( );
}


/**
 * @api public
 *
 * Immediately check for the existence of the selector, notify on change,
 * only stop when context argument is edited
 *
 * :FIXME - Currently only gets cleaned after update
 *
 * @param {String} selector - the string used to check for element presence
 *
 * @returns {jQueryPromise} -  promise notifies whenever element val or text changes.
 */

function progressCheck( selector ) {
  var obj = { complete: false, value: null, fail:  false },
      oldVal = null,
      $el = instantCheck( selector ),
      deferred = $.Deferred( );
  
  // it doen't feel right setting values.
  obj.remove = function (success) {
    if ( success ) { obj.complete = true; }
    else { obj.fail = true; }
  };

  if ( $el.length ) {
    obj.value = obtainValue( $el );
    deferred.notify( $el, obj );
  }
  
  if ( obj.complete ) {
    deferred.resolve( $el );
    return true; // Clears the interval
    }

  if ( obj.fail ) {
    deferred.reject( );
    return true; // Clears the interval
  }
  log( '#progressCheck - calling interval', obj );
  interval( function( ) {
//     log( 'inside #progressCheck interval', obj);
    $el = instantCheck( selector );
    obj.value = obtainValue( $el );
    if ( !utils.type(obj.value, 'nan') && !utils.type(obj.value, 'undefined') &&
        !utils.type(obj.value, 'null') &&  (oldVal !== obj.value) ) {

      oldVal = obj.value;
      deferred.notify( $el, obj );
    }
    
    if ( obj.complete ) {
      deferred.resolve( $el );
      log( '#progressCheck - success', obj );

      return true; // Clears the interval
    }

    if ( obj.fail ) {
      deferred.reject( );
      log( '#progressCheck - rejection', obj );

      return true; // Clears the interval
    }
    

  });

  return deferred.promise( );
}

},{"../settings":26,"./debug":5,"./jq":8,"./utils":11}],7:[function(require,module,exports){
'use strict';


/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};
},{}],8:[function(require,module,exports){
'use strict';


/**
* A wrapper around jQuery to allow for use in a test environment
*/

module.exports = window.VEjQuery || window.$;
},{}],9:[function(require,module,exports){
'use strict';

/**
 * @module `common/masks`
 *
 * Allows for default regex to be applied to data before storage.
 */


// Taken from http://stackoverflow.com/questions/25910808/javascript-regex-currency-symbol-in-a-string#27175364
var ScRe = /[\$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6]/,

masks = {

  number: function( str ) {
    var num = String(str).match(/([\d]{3,25})/);
    return num[1];
  },


  alphanumeric: function( str ) {
    var alpha = String(str).match(/([\dA-Za-z]{4,25})/);
    return alpha[1];
  },

  // obtain currency value.
  currency: function( str ) {
    return String( str ).replace(/[^0-9\.,]/g, '');
  },


  // spec for returning a currency symbol
  symbol: function( str ) {
    var symbol = String( str ).match(ScRe);
    return symbol[0];
  },


  nothing: function( str ) {
    return String( str );
  }
};


/**
 * @exports masks
 */

module.exports = masks;

},{}],10:[function(require,module,exports){
'use strict';


/**
 * @module common/url-matcher
 *
 * @description
 * Exported as a class, but should only be used as a singleton. Managed by the VeAdsController Class
 *
*/

'use strict';

var utils = require('./utils'),
    $ = require('./jq'),
    matcher;


/**
 * Constants
 */

var MATCH_PROPERTY = '__MATCH__'; // Determines whether a URL matches




/**
 * Cached regular expressions for matching named param parts and splatted parts of route strings.
 */

var optionalParam = /\((.*?)\)/g;
var namedParam    = /(\(\?)?:\w+/g;
var splatParam    = /[*]{1}/g;
var doubleSplatParam = /[*]{2}/g; // when used, should be used alone
var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;


/**
 * @class Matcher
 *
 * @description
 * This class instantiates an object which stores the current url (constantly updates)
 * and checks to see that the urls passed to it relevant methods are relevant.
 *
 * @method test -  takes in a url pattern (or regex), [params] and returns a boolean => Are we on the correct page
 * @method match - returns the matches found.
 */

function Matcher( pageURL ) {
  this.pageURL = pageURL || this.generatePageURL( );
  this.searchObject = this.generateSearchObject( );

  //TODO: watch for hashchanges, if we decide to capture the data
}


/**
 * @method
 * @description
 * A method to access the page URL, allows for stubbing out window.location in the
 * test suite
 *
 * @api private
 *
 * @returns {string} - the full page URL - this is likely to change.
 */

Matcher.prototype._getPageURL = function( ) {
  if ( this.locationObj ) {
    return this.locationObj;
  } else {
    return this.locationObj = utils.parseURL( window.location.href );
  }
};


/**
 * @method
 *
 * @returns {Object} - object of all the params
 */

Matcher.prototype.generateSearchObject = function( ) {
  var urlObj = this._getPageURL( );
  return convertSearchToObject( urlObj.query );
};


/**
 * @method
 *
 * @returns a lowercase url string without any unneccessary elements
 */

Matcher.prototype.generatePageURL = function( ) {
  var urlObj = this._getPageURL( );
  var dirtyURL =  urlObj.hostname + ( (urlObj.pathname.length > 1) ? urlObj.pathname : '' ); // strip `/` when empty url

  return cleanURL(dirtyURL);
};


/**
 * @method
 *
 * @api private
 *
 * @description
 * Convert a pattern string into a regular expression,
 * suitable for matching against the current page URL.
 *
 * @param {string} pattern - the url pattern to transform into a regex object
 *
 * @returns {RegExp} - used to run a test again the pageURL.
 */

Matcher.prototype._patternToRegex = function( pattern ) {
  pattern = pattern.replace(escapeRegExp, '\\$&')
    .replace(optionalParam, '(?:$1)?')
    .replace(namedParam, function(match, optional) {
      return optional ? match : '([^/?]+)';
    })
    .replace(doubleSplatParam, '([^?]+|[^?]?)') // greedy match!
    .replace(splatParam, '([^\\/?]*?)'); // .*? non-greed match http://forums.phpfreaks.com/topic/265751-how-does-it-work/

  return new RegExp('^' + pattern + '(?:\\?([\\s\\S]*))?$');
};



/**
 * @method
 *
 * @api public
 *
 * @description
 * The main method for checking if two urls match, taking into account params
 *
 * @params {String|Object} pattern - a url pattern or object with a params pattern as well
 * patter can be an object with properties params, url, hash.
 *
 * :TODO add a way of matching explicitly zero parameters (maybe params should default to null set to `{}` when strictly no params)
 */

Matcher.prototype.match = function( pattern ) {
  var obj = {},
      urlMatches,
      paramMatches,
      returnObj = {},
      _this = this;

  if ( !utils.type(pattern, 'object') ) {
    obj.url = pattern;
  }

  else {
    obj = pattern;
  }

  urlMatches = this.checkPatternMatches( obj.url );
  paramMatches = this.checkParamMatches( obj.params );
  if ( urlMatches[ MATCH_PROPERTY ] && paramMatches[ MATCH_PROPERTY ] ) {
    return $.extend( { }, urlMatches, paramMatches );
  }

  returnObj[ MATCH_PROPERTY ] = false;
  return returnObj;

};


/**
 * @method
 *
 * @param {String} pattern - the pattern passed into the object
 * @param {String} item
 */

Matcher.prototype.checkPatternMatches = function( pattern, item ) {
  var regex, names, matches, bound = {}, captured, ii, name;

  bound[ MATCH_PROPERTY ] = false; // default to no match

  if ( !item ) { pattern = cleanURL( pattern ); }

  regex = this._patternToRegex( pattern );
  names = this._getNamedParameters( pattern );

  matches = regex.exec( item || this.pageURL ); // default to using the page url
  if ( !matches ) { return bound; }


  captured = matches.slice( 1 );
  bound[ MATCH_PROPERTY ] = true; // the URL matches

  for ( ii = 0; ii < captured.length; ii++ ) {
    name = names[ ii ];
    if ( !captured[ ii ] ) { continue; }

    if ( name === '_' ) {
      bound._ = bound._ || [ ];
      bound._.push( captured[ ii ] );
    } else {
      bound[ name ] = captured[ ii ];
    }
  }

  return bound;
};


/**
 * @method
 *
 * Ensure that each specified parameter matches
 *
 * @param {Object} params - specific url parameters to match to the current URL parameter
 */

Matcher.prototype.checkParamMatches = function( params ) {
  var obj, decodedObj, bound = { }, _this = this;

  bound[ MATCH_PROPERTY ] = true; // default to matching

  if ( !utils.objectLength( params ) ) { return bound; }

  $.each( params, function(key, value) {
    var decodedValue;


    key = String( key );
    value = String( value );
    decodedValue = decodeURIComponent( value );

    // debugger;
    if ( _this.searchObject[key] == null ) {
      bound[ MATCH_PROPERTY ] = false;
      return false; // Break out from jQuery loop
    }

    obj = _this.checkPatternMatches( value, _this.searchObject[key] );
    decodedObj = _this.checkPatternMatches( decodedValue, _this.searchObject[key] );

    if ( obj[ MATCH_PROPERTY ] ) {
      $.extend( bound, obj );
      return 'continue'; // Continue jQuery loop
    }

    else if ( decodedObj[ MATCH_PROPERTY ] ) {
      $.extend( bound, decodedObj );
      return 'continue'; // Continue jQuery loop
    }

    else {

      bound[ MATCH_PROPERTY ] = false;
      return false; // Break out from jQuery loop

    }
  });

  return bound;

};



/**
 * @method
 *
 * @api private
 *
 * @description
 * Used to obtain any  named parameters from the URL
 */

Matcher.prototype._getNamedParameters = function ( pattern ) {
  var regex, names, results, name;
  regex = new RegExp( '((:?:[^\\/\(\)]+)|(?:[\*])|(?:[\*\*]))', 'g' );
  names = [ ];

  results = regex.exec( pattern );

  /*
   * Loop through until results is null.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#Example:_Finding_successive_matches
   *
   * Perhaps change to not throw errors here.
   */
  while ( results ) {
    name = results[1].slice(1);

    if ( name == '_' ) {
      throw new TypeError( ':_ can\'t be used as a pattern name in pattern: ' + pattern );
    }

    if ( $.inArray(name, names) > -1 ) {
      throw new TypeError( 'duplicate pattern name :' + name + ' in pattern: ' + pattern );
    }

    names.push( name || '_' );
    results = regex.exec( pattern );
  }

  return names;
};


/**
 * Exports `Matcher`
 */

module.exports = matcher = new Matcher();
matcher.MATCH_PROPERTY = MATCH_PROPERTY;
matcher.Matcher = Matcher;
matcher.escapeRegExp = escapeRegExp;


/**
 * @function
 *
 * @description
 * generate search object
 *
 * @param {String} searchString - parameters passed into the URL
 */

function convertSearchToObject( searchString ) {
  if (searchString === '' || searchString === '?') { return {}; }
  var queries, ii, searchObject = {}, split;
  queries = searchString.replace(/^\?/, '').split('&');
  for(ii = 0; ii < queries.length; ii++) {
    split = queries[ii].split('=');
    searchObject[split[0]] = split[1];
  }
  return searchObject;
}


/**
 * @function
 *
 * @description
 * remove unwanted items from a URL
 * takes `https://www.awesome.com/hello/my`
 * outputs => `awesome.com/hello/my`
 *
 * @param {String} dirtyURL - parameters passed into the URL
 */

function cleanURL(dirtyURL) {
  try {
    var url = (dirtyURL + '').toLowerCase();
    url = url.replace(/http[s]?:\/\//, '');
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

},{"./jq":8,"./utils":11}],11:[function(require,module,exports){
'use strict';

/**
* Useful utilities that will be used throughout the codebase.
* @module `common`
*
* Pixel and script creation.
*/


var $ = require( './jq' );

/**
 * `toString` reference.
 * Store for later usage
 */

var toString = Object.prototype.toString;




/**
 * Exports methods defined below
 */

module.exports = {

  parseURL: parseURL,

  type: type,

  objectLength: objectLength,

  whenAny: whenAny,

  // Scripts and Image pixels

  getScript: getScript,

  getImage: getImage

};



/**
 * Return the correct URL and then expect it to work.
 *
 */

function parseURL( url ) {
  var a = document.createElement('a');
  a.href = url;

  return {
    element: a,
    href: a.href,
    host: a.host,
    port: '0' === a.port || '' === a.port ? '' : a.port,
    hash: a.hash,
    hostname: a.hostname,
    pathname: a.pathname.charAt(0) !== '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || ':' === a.protocol ? 'https:' : a.protocol,
    search: a.search,
    query: a.search.slice(1) // Nice utility for pre-stripping out the `?`
  };
}


 /**
 * Return the type of `val` or a boolean comparision.
 *
 * @param {Mixed} val - the element being tested against.
 * @param {string} testType[optional] - if passed in then th function returns a boolean
 * @return {Boolean | string} - returns a boolean if 2 parameters are passed in, otherwise returns a string
 *
 * @api public
 */

function type( val, testType ) {
  switch( toString.call(val) ) {
    case '[object Date]':
      return testType ? testType === 'date' : 'date';
    case '[object RegExp]':
      return testType ? testType === 'regexp' : 'regexp';
    case '[object Arguments]':
      return testType ? testType === 'arguments' : 'arguments';
    case '[object Array]':
      return testType ? testType === 'array' : 'array';
    case '[object Error]':
      return testType ? testType === 'error' : 'error';
  }

  if( val === null ) { return testType ? testType === 'null' : 'null'; }
  if( val === undefined ) { return testType ? testType === 'undefined' : 'undefined'; }
  if( val !== val ) { return testType ? testType === 'nan' : 'nan'; }
  if ( $ && (val instanceof $) ) {return testType ? testType === 'jquery' : 'jQuery'; }
  if( val && val.nodeType === 1 ) { return testType ? testType === 'element' : 'element'; }
  val = val.valueOf ? val.valueOf() : Object.prototype.valueOf.apply(val);
  return testType ? testType === typeof val : typeof val;
}


/**
 * Return the length of the current object
 *
 * @param {Object} obj - the object to be measured.
 *
 * @return {Number} - returns the length of the objects own elements
 *
 * @api public
 */

function objectLength( obj ) {
  var len = 0,
      key;
  for ( key in obj ) {
    if ( obj.hasOwnProperty(key) ) { len++; }
  }

  return len;
}


/**
 * Generate search object
 *
 * @param {String} searchString - parameters passed into the URL
 */

function convertSearchToObject( searchString ) {
  if (searchString === '' || searchString === '?') { return {}; }
  var queries, ii, searchObject = {}, split;
  queries = searchString.replace(/^\?/, '').split('&');
  for(ii = 0; ii < queries.length; ii++) {
    split = queries[ii].split('=');
    searchObject[split[0]] = split[1];
  }
  return searchObject;
}


/**
 * @function
 *
 * @description
 * Remove unwanted elements from a URL
 *
 * @param {String} dirtyURL - parameters passed into the URL
 */

function cleanURL(dirtyURL) {
  try {
    var url = (dirtyURL + '').toLowerCase();
    url = url.replace(/http[s]?:\/\//, '');
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


/**
 * @api public
 *
 * Resolves when an array of promises are completed,
 * only stop when context argument is edited
 *
 * @param {Array} promiseArray - an array or promises to look through.
 * @param {Promise|Optional} [promise1, promise2, ...] - promise arguments
 *
 * @returns {jQueryPromise} -  promise notifies whenever element val or text changes.
 */

function whenAny( promiseArray ) {
  var finish = $.Deferred( );

  if ( arguments.length > 1 ) {
    promiseArray = Array.prototype.slice.call( arguments );
  }

  $.each( promiseArray, function( index, promise ) {

    promise.done( function( ) {
      var args = [].slice.call( arguments );
      finish.resolve.apply(finish, args )
    });
  });

  return finish.promise( );
}



/**
 * A wrapper around the inbuilt jQuery getScript function
 * Here we just force caching to be turned on.
 *
 * @param  {String} src - The URL to obtain our script from
 *
 * @return {jQueryPromise}     A jQuery promise with .done and .then methods.
 */

function getScript( src, cb ) {
  return $.ajax( {
		type: 'GET',
		url: src,
		data: null,
		success: cb,
		dataType: 'script',
    cache: true
  });
}


/**
 * Rather than adding a pixel to the DOM we take advantage of the infamous
 * `web bug` (beacon) to generate a transparent `GET` request for an image
 * pixel.
 *
 * Much more performant
 *
 * @param  {String} src - pixel URL
 * @return {jQueryPromise}     A promise with `.done` and `.then` methods
 *                             for chaining.
 */

function getImage( src ) {
  var image = new Image(1, 1),
      deferred = $.Deferred( );

  image.onload = function() {
    deferred.resolve( );
  };

  image.src = src;

  return deferred.promise( );
}

},{"./jq":8}],12:[function(require,module,exports){
'use strict';

/*************************************************************************************
 * @module `data\DataElement`                                                        *
 *                                                                                   *
 * Where we capture the dynamic elements that wil be used throughout the application *
 *************************************************************************************/


var utils = require( '../common/utils' ),
    capture = require( './capture' ),
    Emitter = require( '../common/emitter' ),
    store = require( '../storage/store' ),
    settings = require( '../settings' ),
    $ = require( '../common/jq' ),
    Page = require( '../pages/Page' ),
    types = require( './types' ),
    debug = require( '../common/debug' );






/**
 * Fallback defaults, cached here  - FIXME:
 * @type {Object}
 */

var fallbacks = {
  '__timestamp__': $.now(),
  '__random__': ('0000' + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
};

/**
 * @class
 *
 * A piece of data, either an Array, or a single value, used to set information
 * for storage in our store.
 *
 * Data is collected primarily from the DOM, but can also be applied from the
 * global scope via variables attached to the `window`.
 *
 * Data is also retrieved from the dataElement via pixels which may need them
 * in order to make up their
 *
 * @param {Object} config tell the data element what it needs to capture
 */

function DataElement( config, page ) {

  if (page instanceof Page) {
    this.page = page;
    this.currentPage = true; // This is being captured from the current page.
  }

  page = page || {};
  this.storeConfig( config, page );
  

}


Emitter( DataElement.prototype );

/**
 * Store all the configuration for this data Element
 *
 *
 * @param  {Object} config - configuration as set up in the veAds tool
 *
 */

DataElement.prototype.storeConfig = function ( config, page ) {
  this.config = config;
  this.name = config.name;
  this.type = config.type;
  this.valueType = types[config.type]; // single or list
  this.id = config.id;
  this.capture = config.capture;
  this.fallback = config.fallback; // the value to use if nothing else can be found.

  this.urlData = page.matchingURLs || [{}];
  this.key = this.generateKey(); // used for storage

  this.logger();
};

/**
 * @method logger
 * 
 * Set up logging for this class
 */

DataElement.prototype.logger = function() {
  this.log = debug('ve:dataElement:' + this.type + ':' + this.id);
};


/**
 * Capture the element from the page
 */
DataElement.prototype.setData = function ( ) {
  this.log( 'About to set data with the following object', this.config );
  capture[this.capture.type]( this.config, this );

};


/**
 * @method getValue
 * @api public
 *
 * obtain value from the cache, currently doesn't do much. However this should
 * be used rather than direct access to future proof the code.
 *
 * @return {String|Array} value based on the key
 */

DataElement.prototype.getValue = function ( ) {
  this.log('VALUE!!', this.value);
  var val = this.value || ((this.valueType === 'list') ? [] : '');
  this.log('#getValue with value', val);
  return val;
};


/**
 * Generate a unique key
 * @return {String} [description]
 */
DataElement.prototype.generateKey = function ( ) {
  return settings.fromObjectConfig('uuid') + this.type + this.id;
};



/**
 * Make value quickly available to observers of this object.
 *
 * @param  {String|Array} value value from DOM
 */

DataElement.prototype.cacheValue = function( value ) {
  this.lastUpdated = ($.now()); // currently not used but available for optimisations
  this.log('Caching value', value, this.lastUpdated);
  this.value = value;
};


/**
 * @method getFallback
 * @api public
 *
 * Either use the fallback value provided or if special case return a generated
 * timestamp or random number
 *
 * @return {String} Fallback value to return
 */
DataElement.prototype.getFallback = function ( ) {
  var fallback =  String( fallbacks[this.fallback] || this.fallback );
  this.log('#getFallback - The fallback value being obtained', fallback);
  return fallback;
};


/**
 * Exports `DataElement`
 */

module.exports = DataElement;

},{"../common/debug":5,"../common/emitter":7,"../common/jq":8,"../common/utils":11,"../pages/Page":17,"../settings":26,"../storage/store":28,"./capture":13,"./types":14}],13:[function(require,module,exports){
'use strict';

/**
 * @module `data/capture`
 *
 * used to set the variable depending on what has been passed into the object
 */

var utils = require( '../common/utils' ),
    elements = require( '../common/elements' ),
    $ = require( '../common/jq' ),
    escapeRegExp = require('../common/url-matcher' ).escapeRegExp,
    masks = require( '../common/masks' ),
    log = require( '../common/debug' )('ve:capture');




/**
 * @exports capture
 *
 * Object allowing for quick usage with the dataElement objects to set elements
 */

module.exports = {

  selector: selector,

  globalVariable: globalVariable,

  url: url,

  dataLayer: dataLayer,

  dataLayerReverse: dataLayerReverse

};


/**
 * Run through the regex matchers, followed by the regex exclusions
 *
 * @param  {String} value    - initial value to be transformed
 * @param  {Object} regexObj - provided by the dataElement.regex setting
 * @return {String}          - transformed string value
 */

function runRegex( value, regexObj ) {
  var inclusions = regexObj.include,
      exclusions = regexObj.exclude;

  if ( utils.type(inclusions, 'string') ) {
    inclusions = [ inclusions ];
  }

  if ( utils.type(exclusions, 'string') ) {
    exclusions = [ exclusions ];
  }

  if ( utils.type(inclusions, 'array') && inclusions.length ) {
    value = match( value, inclusions );
  }

  if ( utils.type(exclusions, 'array') && exclusions.length ) {
    value = replace( value, exclusions );
  }

  return value;

}


/**
 * Replace values via regex from exclusions array - used to transform values
 *
 * At the moment this defaults to global and case insensitive as we want to avoid
 * using regex literals in the config settings.
 *
 * @param  {String} value      - initial value to match against
 * @param  {Array} inclusions  - list of regex transformations to linearly match
 * @return {String}            - updated value
 */

function replace( value, exclusions ) {
  $.each( exclusions, function( index, regexString ) {
    var regexObj;

    // Make sure string properly escaped
    regexString = regexString.replace(escapeRegExp, '\\$&');

    // currently hardcode global replace
    regexObj = new RegExp( regexString, 'gi');
    value = value.replace(regexObj, '');
  });

  return value;
}


/**
 * Used to match regex expressions
 *
 * At the moment when there is now match found we keep the value.
 *
 *
 * @param  {String} value      - initial value to match against
 * @param  {Array} inclusions  - list of regex transformations to linearly match
 * @return {String}            - updated value
 */

function match( value, inclusions ) {
  $.each( inclusions, function( index, regexString ) {
    var regexObj;
    console.info(value);

    // currently hardcode global replace
    regexObj = new RegExp( regexString, 'i');
    console.info(regexObj);
    value = (value.match(regexObj) && value.match(regexObj)[1]) || value; // If no match found we keep the value;
    
  });
  log('Matching with REGEX', value, inclusions);
  return value;
}



/**
 * Transform the value passed in with the automatic masks that are run.
 * @param  {String} value current value
 * @param  {String} mask  masking function to be used
 * @return {String}       Value run through strings
 */

function runMasks( value, mask ) {
  var fn = masks[mask] || masks['nothing'];
  return fn(value);
}


/**
 * Takes in a value (as key) and maps it to the corresponding value.
 *
 * @param  {String} value    Initial value passed in.
 * @param  {Object} mappings Transform a value based on predefined map.
 * @return {String}          Updated value where mappings are present.
 */

function runMappings( value, mappings ) {
  if ( !utils.objectLength(mappings) ) {
    return value;
  } else {
    return mappings[value] || value;
  }

}


/**
 * String together all of the value transformations that are possible.
 * @param  {String} value  - the value that was originally captured.
 * @param  {Object} config - original config object
 * @return {String|Array}  - single value or list of values
 */

function runTransformations( values, config ) {
  if ( utils.type(values, 'array') ) {
    log('#runTransformations - running on a LIST of values');
    $.each(values, function( index, value ) {
      values[index] = transform( value, config );
    });
    return values;
  }
  
  log('#runTransformations - SINLE value type');
  return transform(values, config);
}

/**
 * Transform a single value string
 * @param  {String} value  - Value to be transformed
 * @param  {Object} config - original configuration object
 * @return {String}        - Individual value that has been transformed
 */
function transform( value, config ) {
  log('#transform - running on value');
  value = runRegex( value, config.regex );
  value = runMasks( value, config.mask );
  value = runMappings( value, config.mappings );
  return value;
}




var singleOrList = {

  /**
   * Checks element and returns a String
   * @param  {jQueryElement} $el - the element under question (only looks at first)
   * @return {String}     The value from the element
   */
  single: function( $el ) {
    log('#singleOrList.single - Obtaining single value from element.');
    return elements.obtainValue( $el );
  },

  /**
   * Checks elements and returns an array of their values (or text)
   * @param  {jQueryElements} $el - the elements being captured
   * @return {Array}     - An array of values to be transformed
   */
  list: function( $el ) {
    log('#singleOrList.list - Obtaining multiple values from element.');
    return elements.obtainValues( $el );
  }
};



/**
 * Stores the captured value onto the dataElement
 *
 * @param  {DataElement} dataElement - the dataElement being set.
 */

function storeData( dataElement, value ) {
  
  dataElement.cacheValue( value );
  dataElement.emit( 'store' );
}





/**
 * Parse Global Variables
 *
 * Split up and seperate by dots'. This can currently only match value and not
 * elements.
 *
 * @param {String} element - `helper.name` is called from the context of the window.
 *
 * @returns {String}       - currently we only support strings for this
 */

function parseGlobals( valueString ) {
  var context = window,
      splitByDots = valueString.split('.');

  $.each(splitByDots, function(index, value) {
    // Context stores the most recent value or context
    context = context[ splitByDots[index] ];
  });

  return String( context );
}



/**
 * Obtains value(s) from a dom selector.
 *
 * Can either be single or a list.
 *
 * @param  {Object} config - object containing the majority of the configuration
 * @param  {DataElement} dataElement - the dataElement we're working on
 */

function selector( config, dataElement ) {
  log('Running via DOM #selector', config, dataElement);
  var sel = config.capture.element,
      arrValue = [], value = '',
  fn = function ( $el, obj ) {
    log('#selector value found about to run transformations', $el);
    value = singleOrList[dataElement.valueType]($el);
    log('#selector VALUES', value, dataElement);
    value = runTransformations(value, config);

    storeData( dataElement, value );
  };


  // Very expensive, avoid using this!
  if ( config.capture.keepChecking && (dataElement.valueType !== 'list') ) {
    log('#selector keep checking active setting up progress check');
    elements.progressCheck( sel )
    .progress( fn );
  } else {
    log('#selector keep checking NOT active simpler check for element ');
    elements.dynamicCheck( sel )
    .then( fn );
  }
}



/**
 * Obtain a global variable from the window
 *
 * This currently only supports being run on a single value.
 * @param  {Object} config - object containing the majority of the configuration
 * @param  {DataElement} dataElement - the dataElement we're working on
 */

function globalVariable ( config, dataElement ) {
  var value = parseGlobals(config.capture.element);
  value = runTransformations(value, config);
  // cache the value
  storeData( dataElement, value );
}


/**
 * Obtain data from the captured values in the URL.
 *
 * @param  {Object} config - object containing the majority of the configuration
 * @param  {DataElement} dataElement - the dataElement we're working on
 */
function url( config, dataElement ) {
  var value = '';
  $.each(dataElement.urlData, function( index, obj ) {
    if ( obj.matches[config.capture.element] ) {
      value = obj.matches[config.capture.element];
      return false; // break the loop
    }
  });
  value = runTransformations(value, config);
  storeData( dataElement, value );
}



/**
 * Obtain from dataLayer
 */

function getFromDataLayer(key, reverse) {
  var dataLayer = window.dataLayer;
  if (!dataLayer) {
    return '';
  }

  var reverseDataLayer = reverse ? dataLayer.reverse() : dataLayer;
  var keyValue = '';
  for (var ii = 0; ii < reverseDataLayer.length; ii++) {
    if (reverseDataLayer[ii][key]) {
      keyValue = reverseDataLayer[ii][key];
      break;
    }
  }
  return keyValue;
}


/**
 * Obtain data from the dataLayer which some websites use (e.g. Etihad).
 *
 * @param  {Object} config - object containing the majority of the configuration
 * @param  {DataElement} dataElement - the dataElement we're working on
 */

function dataLayer( config, dataElement, reverse ) {
  var value = getFromDataLayer( config.capture.element, reverse );
  value = runTransformations(value, config);
  storeData( dataElement, value );
}


/**
 * Obtain data from the dataLayer which some websites use (e.g. Etihad).
 *
 * Reverse the array to only find most recent updates.
 *
 * @param  {Object} config - object containing the majority of the configuration
 * @param  {DataElement} dataElement - the dataElement we're working on
 */

function dataLayerReverse( config, dataElement ) {
  dataLayer( config, dataElement, true );
}

},{"../common/debug":5,"../common/elements":6,"../common/jq":8,"../common/masks":9,"../common/url-matcher":10,"../common/utils":11}],14:[function(require,module,exports){
/**
 * Type of dataElements and whether they store lists or single values.
 * @type {Object}
 */

var types = {

  orderId: 'single',
  orderVal: 'single',
  productId: 'single',
  productList: 'list', // from basket page and category pages (limited to 5)
  priceList: 'list', // from basket and category pages
  currency: 'single'
};


/**
 * @exports `types`
 * @type {Object}
 */

module.exports = types;

},{}],15:[function(require,module,exports){
(function (global){
global.debugVeAds = require( 'debug' ); // Make debug available by default when running tests
var Main = require( './main' );
var main = new Main( );
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./main":16,"debug":1}],16:[function(require,module,exports){
'use strict';

/**
 * Module Dependencies
 */

var utils = require( './common/utils' ),
    $ = require( './common/jq' ),
    Page = require( './pages/Page' ),
    store = require( './storage/store' ),
    DataElement = require( './data/DataElement' ),
    settings = require( './settings' ),
    pixelTypes = require( './pixels/type' ),
    debug = require( './common/debug' ),
    elementTypes = require( './data/types' ),
    Pixel = require( './pixels/Pixel' );


/**
 * @module ./main
 * Expose `Main`.
 */

module.exports = Main;


/**
 * Page Type ID's. Useful for sorting
 */

var pageTypeOrder = {
  ros: 1, // runs before all other pages ( automatically injected in );
  conversion: 2, // runs and if matched should prevent anything else from matching.
  product: 3,
  category: 4,
  basket: 5,
  custom: 6
};

var injectableROS = {
  id: 0,
  name: 'ROS Injected Page',
  type: 'ros',
  // An empty array will never match.
  urls: ['**'], // Match everything
  dynamicIdentifiers: []
};



/**
 * @class Main
 *
 * The `Main` class is responsible for glueing the whole script together
 *
 * 1. Check whether the browser supports localStorage and JSON
 * 2. Use jQuery promises to handle async code sometimes failures happen.
 * 3. Check VeAds object structure (simple test)
 * 4. Create the pages using sort by order
 *
 * @param {Object} [veAdsObj] - the main veads object
 */

function Main( veAdsConfig ) {
  var _this = this;
  this.log = debug( 've:main' );
  this.veAdsConfig = veAdsConfig || this.getVeAdsConfig( );
  this.runChecks( ) // Check for browser compatibility

  .then( function() {
    _this.instantiatePages( ); // Create all pages from the object
  });

}


/**
 * @method
 * @public
 * Obtain the veAds object
 */

Main.prototype.getVeAdsConfig = function( ) {
  try {
    return $.extend( {}, window.veTagData.settings.veAds );
  } catch (e) {
    this.log( new Error( 'Please define a valid veAds object' ), e );
  }
};



/**
 * @method
 * @public
 * Test for the existence of JSON
 */

Main.prototype.testJSON = function( ) {
  return window.JSON && 'parse' in window.JSON && 'stringify' in window.JSON;
};



/**
 * @method runChecks
 *
 * @public
 *
 * @description
 * Run checks and add scripts for missing functionality.
 * Provide jQuery promises that can be used to determine when functionality is available.
 */

Main.prototype.runChecks = function( ) {
  var deferred = $.Deferred( ); // set up a jQuery deferred
  if ( !this.testJSON() ) {
    this.log( 'NO JSON on this page, adding a script to the page.');
    this.jsonAvailable = false;
    this.jsonPromise = $.getScript('https://cdnjs.cloudflare.com/ajax/libs/json3/3.3.2/json3.min.js')
    .done(function() {
      deferred.resolve();
    });
  }

  else {
    this.jsonAvailable = true;
    this.log('JSON natively available');
    deferred.resolve( );
  }

  return deferred.promise();

};


/**
 * Check that a property value resides within an array of objects
 *
 * @param  {Array} array     Array of objects
 * @param  {String} property The property to check
 * @param  {String} value    The value to test against
 * @return {Boolean}         Result of the test
 */
function propertyValueInObjectArray(array, property, value) {
  var answer = false;
  $.each(array, function(index, object) {
    if ( object[property] === value ){
      answer = true;
      return false;
    }
  });

  return answer;
}

/**
 * @method instantiatePages
 * @public
 *
 *  - Sort the pages based on `pageTypeOrder`
 * Loop through pages and add class to the page object
 */

Main.prototype.instantiatePages = function( ) {
  this.log( 'Instantiating PAGES' );
  var _this = this;

  if ( !propertyValueInObjectArray(this.veAdsConfig.pages, 'type', 'ros') ){
    this.veAdsConfig.pages.unshift(injectableROS); // Add ROS page to the front of the queue
  }
  this.veAdsConfig.pages.sort(pageSort); // Sort the pages according to type.

  this.log('Pages have been sorted into a running order', this.veAdsConfig.pages);
  $.each( _this.veAdsConfig.pages, function( index, pageObj ) {
    if ( pageObj[settings.MAIN_PAGE_PROPERTY] ) { return 'continue'; } // Only generate instance if none currently exists

    var page = new Page( pageObj ); // CHECK: This may need certain parameters
    pageObj[settings.MAIN_PAGE_PROPERTY] = page;
    _this.setupPageListeners( page );
  });
};


/**
 * @method setupPageListener
 * 
 *
 * Pages have been instantiated so add listeners to them.
 */

Main.prototype.setupPageListeners = function(page) {
  this.log( 'Setting page listener for: ' + page.name );

  // Bind to this using cross browser $.proxy instead of Function.prototype.Bind
  page.once('success', $.proxy(this.setPageElements, this, page));


  // Currently is a potential for race conditions here. What if we runPagePixels
  // before some of the data becomes available.
  page.once('success', $.proxy(this.runPagePixels, this, page));

  page.once('fail', $.proxy(page.off, page));
  
  // Launch this
  page.checkURLs();

};


/**
 * @method setupDataListeners
 *
 * Data Element has been instantiated and set so now listen for storage messages
 *
 * @param  {DataElement} dataElement - The dataElement being listened to.
 */

Main.prototype.setupDataListeners = function ( dataElement ) {
  this.log('#setupDataListeners - setting up data listeners for: ' + dataElement.name, dataElement);
  dataElement.once('store', $.proxy(this.storeValue, this, dataElement));
};


/**
 * @method storeValue
 *
 * store the value.
 *
 * @param  {String} value - Value to be saved between pages
 * @param  {String} key   - Key used to reference the value between pages
 */
Main.prototype.storeValue = function ( dataElement ) {
  var key = dataElement.key, value = dataElement.getValue();
  this.log('#storeValue - storing key: ' + key + ', with value: ' + value );
  return store.set( key, value );
};


/**
 * Get the value from storage.
 *
 * @param  {String} key Unique Key for storage
 * @return {[type]}     [description]
 */
Main.prototype.getValue = function ( key ) {
  return store.get( key );
};

/**
 * Used to sort pages pages based on `pageTypeOrder` index
 */

function pageSort ( a, b ) {
  return pageTypeOrder[a.type] - pageTypeOrder[b.type];
}


/**
 * @method setPageElements
 *
 * Sets all data on the current page, before they may need to be used in any pixels that
 * the page displays.
 *
 * The criteria is based on the Page ID.
 *
 * Ensure that two DataElements are not instantiated twice.
 *
 * @param  {PageObject} page the page object that will need to be checked
 */

Main.prototype.setPageElements = function ( page ) {
  this.log( 'Setting DataElements for identified page ' + page.name, page );
  var _this = this;
  
  // Loop through and check the elements that need to be set on this page.
  $.each(this.veAdsConfig.dataElements, function( index, dataElementConfig ) {
    var dataElementObject;

    // Data Element has already been set
    if ( dataElementConfig[settings.MAIN_DATA_ELEMENT] ) {
      _this.log( 'dataElement object already exists for dataElement: '+ dataElementConfig.name, dataElementConfig );
      dataElementObject = dataElementConfig[settings.MAIN_DATA_ELEMENT];
      dataElementObject.setData( );
      return 'continue'; // Move onto the next one.
    }

    if ( utils.type(dataElementConfig.pages, 'array') && dataElementConfig.pages.length &&
         ($.inArray(page.id, dataElementConfig.pages) > -1) ) {

      dataElementObject = new DataElement( dataElementConfig, page );

      dataElementConfig[settings.MAIN_DATA_ELEMENT] = dataElementObject; // Store it, to avoid duplicates
      _this.setupDataListeners( dataElementObject );
      dataElementObject.setData( ); // Obtain and store the data to cookies or localStorage
    }

  });
};


/**
 * @method runPagePixels
 *
 * Implements the pixels onto the current page.
 *
 * TODO: Think about whether we need to defer this running.
 *
 * @param  {Page} page - used to determine which pixels are running on this type or override.id
 */

Main.prototype.runPagePixels = function ( page ) {
  var _this = this,
      getDataFn = $.proxy(this.obtainDataFromStorage, this );
  // 1. Find all the pixels that run on this page.

  $.each(this.veAdsConfig.pixels, function( index, pixelConfig ) {
    var pixel, type = pixelTypes[pixelConfig.type];

    // Check if this pixel runs on the page type.
    if ( !type.hasOwnProperty(page.type) ){
      _this.log( 'Page type: ' + page.type + ' not supported by pixel: ' + pixelConfig.name );
      return 'continue'; // Continue to next iteration
    }

    // Data Element has already been set
    if ( pixelConfig[settings.MAIN_PIXEL] ) {
      pixel = pixelConfig[settings.MAIN_PIXEL];
    } else {
      pixel = new Pixel( pixelConfig, getDataFn );
      pixelConfig[settings.MAIN_PIXEL] = pixel;
    }
    pixel.run( getDataFn, page.type, page.id );
  });
};



/**
 * @method obtainDataFromStorage
 *
 * Here we look through the dataElements and obtain all the stored values, either
 * directly from an instance, or via their stored value.
 *
 * @param  {Array} requiredData Array of dataElement types that we need to use.
 * @param  {Pixel} pixelObject  The pixel this is being used for
 */
Main.prototype.obtainDataFromStorage = function ( requiredData, pixelObject ) {
  var _this = this,
      data = {};

  $.each(requiredData, function ( index, dataType ) {
    var matchingDataElements =
      generateArrayOfMatchingTypes( _this.veAdsConfig.dataElements, dataType);

    data[dataType] = _this._obtainDataValue( matchingDataElements, elementTypes[dataType] );

  });

  return data;
};



/**
 * @method _obtainDataValue
 * @api private
 *
 * From an array of dateElements pluck one value,
 * 1 - first check value of object
 * 2 - look up value in storage when no current value
 * 3 - last of all use a fallback value for single data elements
 * 4 - rinse and repeat, with last added element winning
 *
 * @param  {Array} elements   List of config objects
 * @param  {String} valueType single or list
 * @return {String|Array}     The item that has been found
 */

Main.prototype._obtainDataValue = function( elements, valueType ) {
  var currentValue = (valueType === 'list' ? [] : ''),
      _this = this;

  $.each(elements, function( index, element ) {
    var dataElement = element[settings.MAIN_DATA_ELEMENT] ||
                    (element[settings.MAIN_DATA_ELEMENT] = new DataElement( element ) );
    if ( dataElement.valueType === 'single' && !currentValue ) {
      currentValue = dataElement.getValue() || _this.getValue(dataElement.key);
    } else {
      currentValue = listChecks( dataElement, currentValue, _this );
    }

  });

  // Only run this to obtain fallbacks and only when `valueType` is single
  if ( valueType === 'single' && !currentValue ) {
    this.log('FALLBACK: No value has been found checking for fallbacks');
    $.each( elements, function (index, element) {
      var dataElement = element[settings.MAIN_DATA_ELEMENT];
      currentValue = dataElement.getFallback();
      _this.log('FALLBACK VALUE USED: Current value found for this.', currentValue, dataElement);
    });
  }

  return currentValue;
};



/**
 * Check through values for items that take a list since an empty array
 * is truthy in javascript.
 *
 * @return {Array}              Current value, updated or not.
 */

function listChecks( dataElement, currentValue, context ) {
  if ( dataElement.getValue().length ){
    return dataElement.getValue();
  }

  // Look within storage
  var storageValue = context.getValue(dataElement.key) || [];
  return storageValue;
}


/**
 * Generates an array of matching types based on the objects passed in.
 *
 * @param  {Array<Object>} objects Array of objects to match
 * @param  {String} types          Type to be checked against
 * @return {Array<Objects>}        The objects with matching types are passed back
 */

function generateArrayOfMatchingTypes (objects, type) {
  var arr = [];
  $.each(objects, function (index, obj) {
    if ( obj.type === type ) {
      arr.push( obj );
    }
  });

  return arr;
}

},{"./common/debug":5,"./common/jq":8,"./common/utils":11,"./data/DataElement":12,"./data/types":14,"./pages/Page":17,"./pixels/Pixel":18,"./pixels/type":24,"./settings":26,"./storage/store":28}],17:[function(require,module,exports){
'use strict';


/**
 * @module pages/Page
 *
 * Class for the central pages used to match the type
 */

var utils = require( '../common/utils' ),
    Emitter = require( '../common/emitter' ),
    matcher = require( '../common/url-matcher' ),
    $ = require( '../common/jq' ),
    settings = require( '../settings' ),
    elements = require( '../common/elements' ),
    criteria = require( '../common/criteria' ),
    debug = require( '../common/debug' );



/**
 * @constructor
 *
 * Represents a Page class within the VeAds object.
 *
 * A page is central to the way VeAds functions. Matches this page and is used to provide
 * a unique id to identify the pages that elements should be got and set from.
 *
 * @param {object} config - takes in an object with configuration attached [REQUIRED]
 */

function Page( config ) {
  
  //TODO: Avoid throwing errors here. 
  if ( !utils.type(config, 'object' ) ) {
    throw new Error ( 'Pages need to be called with a configuration object' );
  }

  this.storeConfig( config );
  this.logger();
  
  this.matchingURLs = [ ];

  this.dynamic = this._checkDynamic( ); // Boolean
  // this.checkURLs(); // Only check urls at the right time
  
  this.log('Page object created');
}


/**
 * @mixin
 *
 * Add emitter methods to Page which will be listend to by main runner
 * Seperation of concerns.
 */

Emitter( Page.prototype );


/**
 * @method
 *
 * Runs through the urls and return the first  the callback
 *
 * @return {Object} returns the first matching page obj
 * @api public
 */

Page.prototype.checkURLs = function( ) {
  var _this = this;
  this.log('Checking through URLs');
  $.each(this.urls, function( index, url ) {
    var matches = matcher.match( url );

    if ( matches[matcher.MATCH_PROPERTY] ) {
      _this.matchingURLs.push( {url: url, matches: matches} );
    }
  });

  // emit matched URLs with the matched URLs when a match is found
  // debugger;
  if ( this.matchingURLs.length && !this.dynamic ) {
    this.log('Page URL matches with object', this.matchingURLs);
    this.pageIdentified( );
  } else if ( this.matchingURLs.length && this.dynamic ) {
    this.log('Page URL matches but dynamic tests are needed', this.matchingURLs);
    this.runDynamics( );
  } else {
    this.emit( 'fail' );
    this.log( 'ZERO MATCHES for: ' + this.name );
  }

};



/**
 * @method
 *
 * Runs through the dynamic identifiers and emits success when one is matched
 * TODO: Needs testing!
 *
 * @api public
 */

Page.prototype.runDynamics = function( ) {
  var promises = [],
      _this = this;
  
  this.log('Dynamically testing');
  $.each( this.dynamicIdentifiers, function( index, identifier) {
    var promise;
    // Stop if there is no selector, or criteria without a value.
    if ( !identifier.selector || (identifier.criteria && !identifier.values) ) {
      _this.log( 'Dynamic Identifier: ' + index+ 1 + ' can\'t run', identifier );
      return 'continue';
    }


    promise = elements.progressCheck( identifier.selector );
    promises.push( promise );
    // check current value against criteria each time.
    promise.progress( function( $el, obj ) {
      _this.log( 'Update in element value', $el, obj );
      $.each( identifier.values, function( index, value ) {
        _this.log('Checking against: ' + value );
        if ( criteria[identifier.criteria](value, obj.value) ) {
          _this.log('Value has been found for: ' + obj.value );
          obj.remove( true ); // Cause promise to be resolved.
          return false; // Stop the iteration
        }
      });

      if ( _this.stopChecks ) {
        _this.log( 'Another dynamic Identifier has already passed' );
        obj.remove( ); // Cause promise to fail.
      }
    });
  });

  // As soon as one dynamicIdentifier
  // TODO: Fix problem with ghost identifiers running long after resolution
  utils.whenAny( promises )
  .done( function( $el ) {
    
    _this.pageIdentified( );
  });
};



/**
 * @method
 *
 * Runs through the urls and return the first  the callback
 *
 * @param {jQueryElement|Optional} $el - only passed when dynamicallyIdentified, not currently used
 * @api public
 */

Page.prototype.pageIdentified = function( $el ) {
  this.log( 'Page Matches for: ' + this.name, this.matchingURLs );
  this.stopChecks = true; // Stops any other intervals from running;
  this.emit( 'success', this );
  
};


/**
 * @method
 *
 * Runs through the urls and return the first  the callback
 *
 * @param {Object} config - returns the first matching page obj
 * @api public
 */

Page.prototype.storeConfig = function( config ) {

  // Make sure id is present
  if ( !utils.type(config.id, 'number') ) {
    throw new Error('Must provide an ID with every page ', config);
  }

  if ( !utils.type(config.type, 'string') ) {
    throw new Error( 'Must be provided with a valid type' );
  }

  this.config = config; // Just in case we ever need to look back here.

  this.id = config.id;
  this.urls = config.urls ||  [];
  this.type = config.type || settings.DEFAULT_PAGE_TYPE;
  this.dynamicIdentifiers = config.dynamicIdentifiers || [];
  this.name = config.name;
};


/**
 * @method
 * 
 * Set up logger for this instance of page
 */
Page.prototype.logger = function() {
  this.log = debug( 've:page:' + this.type +':' + this.id );
};


/**
 * @method
 *
 * Checks wether we are on a page that needs a dynamic identifier
 *
 * @api private
 */

Page.prototype._checkDynamic = function(  ) {
  return !!this.dynamicIdentifiers.length;
};


/**
 * Expose `Page` Class.
 */

module.exports = Page;

},{"../common/criteria":4,"../common/debug":5,"../common/elements":6,"../common/emitter":7,"../common/jq":8,"../common/url-matcher":10,"../common/utils":11,"../settings":26}],18:[function(require,module,exports){
'use strict';

/**
 * @module `pixels/Pixel`
 *
 * The class definition for our pixels which are added to the page.
 *
 */


var utils = require( '../common/utils' ),
    Emitter = require( '../common/emitter' ),
    pixelType = require( './type' ),
    logger = require( '../common/debug' ),
    $ = require( '../common/jq' );


/**
 * @class
 *
 * Pixel class which manages the pixel type and then runs the correct actions
 * based on where this type is able to run and whether any overrides have been
 * requested.
 *
 * We check for the overrides object
 *
 * @param {Object} config - taken directly from the options for this pixel
 * @param {Function} getDataElement - a function that allows for obtaining stored data.
 */

function Pixel( config, getData ) {
  this.storeConfig( config );
  this.logger();
}


Emitter( Pixel.prototype );

/**
 * @method run
 *
 * Called by the `main` object when a page with the correct type has been
 * identified.
 *
 *
 * @param  {Function} getData   The function used to retrieve the neccessary data
 * @param  {String} pageType    The page type calling firing for this pixel
 * @param  {Number} pageID      The unique page ID of the calling page
 */

Pixel.prototype.run = function (getData, pageType, pageID) {
  this.pages.push( pageID );
  this.data = this.collateData(this._pixel[pageType]['needs'], getData);
  this.generatePixels( this.data, this.config, pageType, pageID );
};


/**
 * @method storeConfig
 *
 * Store all config when first instantiating this function
 *
 * @param  {Object} config Defined settings generated manually or through the tool
 */

Pixel.prototype.storeConfig = function ( config ) {
  this.settings = config;
  this.config = config.config;
  this.id = config.id;
  this.type = config.type;
  this.name = config.name;
  this.overrides = config.overrides;
  this._pixel = pixelType[this.type];
  this.pages = [];
};


/**
 * @method logger
 *
 * Convenience method for generating a logging function scoped to this pixel
 */

Pixel.prototype.logger = function ( ) {
  this.log = logger('ve:pixel:' + this.type + ':' + this.id);
};


/**
 * @method collateData
 *
 * Obtain the data from the storage via the `main` orchestrator
 *
 * @param  {Array}   requiredData  An array of all the dataElement types needed
 * @param  {Function} fn           The function called to obtain all data from storage
 */

Pixel.prototype.collateData = function (requiredData, fn) {
  this.log('Collating data for: ', requiredData);
  return fn( requiredData, this );
};


/**
 * Checks the Pixel overrides object
 *
 * @param  {String} pageType The type of page we're currently on
 * @param  {Number} pageID   The ID of the current page
 * @return {Boolean}         True if we should proceed. False if not.
 */

Pixel.prototype.checkOverrides = function (pageType, pageID) {
  this.log( 'Checking for pixel OVERRIDES' );
  if ( !this.overrides.active ) { return true; } // Don't worry - run as normal

  // ROS is acceptable can
  if ( this.overrides.ros && pageType === 'ros' ) { return true; }

  if ( !this.overrides.pages.length ) { return true; } // no page overrides run as normal


  if ( this.overrides.pages.length &&
    $.inArray(pageID, this.overrides.pages) > -1 ) {
    return true;
  }

  this.log( 'The pixel has been OVERRIDDEN' );
  return false;
};


/**
 * @method generatePixels
 *
 * Responsible for placing the actual pixels needed on the page.
 *
 * Also makes a small sense check to be sure that there are actually functions that
 * can be called here.
 *
 * @param  {Object} data        Dynamically generated data from dataElements
 * @param  {Object} config      The hardcoded config object directly from the tool
 * @param  {String} pageType    The page type calling firing for this pixel
 * @param  {Number} pageID      The unique page ID of the calling page
 * @return {Null}
 */
Pixel.prototype.generatePixels = function ( data, config, pageType, pageID ) {
  var runners, _this = this;

  // Check whether we have any overrides
  if ( !this.checkOverrides(pageType, pageID) ) {
    this.log( 'Pixels will not be generated' );
    return; // Don't do anything if page has been overriden
  }


  // Functions to be run
  runners = (this._pixel[pageType] && this._pixel[pageType]['produces']) || [];
  if ( !runners.length ) {
    this.log( 'There are ZERO runners for this pageType:' + pageType );
    return;
  }

  this.log( 'Generating Pixel(s) for: ' + this.name + ' with type: ' + this.type );
  this.log( 'Data to be passed in will be ', data, config );
  $.each(runners, function( index, runner ) {
    var src = runner( data, config );

    if (src) {
      utils.getImage( src );
      _this.log( 'Image pixel generated with `src`: ' + src );
    }
  });

};


/**
 * Exports `Pixel` Class
 */

module.exports = Pixel;

},{"../common/debug":5,"../common/emitter":7,"../common/jq":8,"../common/utils":11,"./type":24}],19:[function(require,module,exports){
'use strict';
var log = require( '../../common/debug' )('ve:pixels:type:appNexus');

module.exports = {

  product: {
    needs: [],
    produces: [product]
  },

  conversion: {
    needs: ['orderVal', 'orderId', 'currency'],
    produces: [conversion]
  },

  ros: {
    needs: [],
    produces: [ros]
  }

};



function conversion(data, config) {
  log('#conversion - 0.data 1.config', data, config);
  return 'https://secure.adnxs.com/px?id=' + config.conversionId +
         '&seg=' + config.segmentConversion + '&order_id=' + data.orderId +
         '&value=' + data.orderVal + '&other=[' + data.currency + ']&t=2';
}

function ros(data, config) {
  return '//secure.adnxs.com/seg?add=' + config.segmentROS + '&t=2';
}

function product(data, config) {
  return '//secure.adnxs.com/seg?add=' + config.segmentProduct + '&t=2';
}

},{"../../common/debug":5}],20:[function(require,module,exports){
var utils = require( '../../common/utils' );
var log = require( '../../common/debug' )('ve:pixels:type:customConversion');


module.exports = {

  conversion: {
    needs: [],
    produces: [conversion]
  }
};




function conversion( data, config ) {
  if ( config.type === 'script' && config.src ) {
    log('adding script to the page');
    utils.getScript( config.src );
    return false; // no image pixel required
  } else {
    return src;
  }
}

},{"../../common/debug":5,"../../common/utils":11}],21:[function(require,module,exports){
var utils = require( '../../common/utils' );


module.exports = {

  ros: {
    needs: [],
    produces: [ros]
  }
};




function ros( data, config ) {
//   console.log(data, config);
  if ( config.type === 'script' && config.src ) {
    utils.getScript( src );
    return false; // no image pixel required
  } else {
    return config.src;
  }
}

},{"../../common/utils":11}],22:[function(require,module,exports){
'use strict';

/**
 * @module
 *
 * Provides pixels for [ros, conversion]
 *
 */

module.exports = {

  conversion: {
    needs: ['orderVal', 'orderId', 'productList'],
    produces: [conversion]
  },

  ros: {
    needs: [],
    produces: [ros]
  }
};


function ros( data, config ) {
  var random = (Math.random() + '') * 10000000000000;
  return 'https://ad.doubleclick.net/ddm/activity/src=' + config.src +
  ';type=invmedia;cat=' + config.catROS + ';ord=' + random;
}

function conversion( data, config ) {
  var qty = data.productList && data.productList.length;
  return 'https://ad.doubleclick.net/ddm/activity/src=' + config.src +
  ';type=sales;cat=' + config.catConversion + ';qty=' + (data.productList.length || 1) +
  ';cost=' + data.orderVal + ';ord=' + data.orderId + '?';
}

},{}],23:[function(require,module,exports){
'use strict';

module.exports = {
  ros: {
    needs: [],
    produces: [ros]
  }
};


/**
 * Produce a flex script on the ROS page.
 *
 * At the moment this is just left as is. 
 *
 * @param  {Object} data   - dynamically obtained data
 * @param  {Object} config - hardcoded data provided
 * @return {String|Boolean}        - If `false` is returned then does the action and nothing more.
 */

function ros(data, config) {
  var flexId = config.flexId, iatDev;

  (function(a) {
    var d = document,
      c = d.createElement('script');
    c.async = !0, c.defer = !0, c.src = a, d.getElementsByTagName('head')[0].appendChild(c);
  })((iatDev = (window.location.href.indexOf('iatDev=1') > -1 || document.cookie.indexOf('iatDev=1') > -1), '//' + (window.location.protocol == 'http:' && !iatDev ? 'h' : '') + 'fp.gdmdigital.com/'+ flexId +'.js?r=' + Math.random() * 1e16 + '&m=992&a='+ flexId + (iatDev ? '&d=1' : '')))

  return false;
}

},{}],24:[function(require,module,exports){
'use strict';


/**
 * Exports `types`
 */

module.exports = {

  ve: require( './ve' ),
  dbm: require( './dbm' ),
  flex: require( './flex' ),
  appNexus: require( './appNexus' ),
  customROS: require( './customROS' ),
  customConversion: require( './customConversion' )

};

},{"./appNexus":19,"./customConversion":20,"./customROS":21,"./dbm":22,"./flex":23,"./ve":25}],25:[function(require,module,exports){
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
    produces: [conversion, conversionItems, conversionNew, conversionItemsNew]
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



function conversion( data, config, base ) {
  var priceList = generateItemString( data.priceList );

  return (base || '//adverts.adgenie.co.uk/conversion.php?companyId=') +
         config.journeyCode + '&items=' + (priceList ? priceList + '|' : '') +
         'BASKETVAL:' + data.orderVal + '&orderId=' + data.orderId;
}

function conversionNew( data, config ) {
  return conversion( data, config, '//veads.veinteractive.com/conversion.php?companyId=' );
}



function conversionItems( data, config, base ) {
  var purchasedItems = generateIdList( data.productList );

  return (base || '//adverts.adgenie.co.uk/genieTracker.php?adgCompanyID=') +
         config.journeyCode + '&adgPurchasedItems=' + purchasedItems;
}

function conversionItemsNew( data, config ) {
  return conversionItems( data, config, '//veads.veinteractive.com/genieTracker.php?adgCompanyID=');
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

},{"../../common/jq":8}],26:[function(require,module,exports){
/**
 * Settings that may be called at any time during the app runtime
 */

var log = require('./common/debug')('ve:settings');

module.exports = {


  /**
   * Page Constants
   */

  DEFAULT_PAGE_TYPE: 'custom', // page that we default to.


  /**
   * Main Constants
   */

  MAIN_PAGE_PROPERTY: '_pageObject', // property to store instantiated page.
  MAIN_DATA_ELEMENT: '_dataElementObject',
  MAIN_PIXEL: '_pixelObject',


  /**
   * Element Constants
   */

  ELEMENT_MS: 500, // milliseconds between checks
  ELEMENT_MAX_RETRIES: 1000, // Maximum number of retries


  /**
   * Dynamic way of getting settings from the config object
   *
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  fromObjectConfig: function ( name ) {
    try {
      return window.veTagData.settings.veAds.config[name];
    } catch(err) {
      log( 'Unable to load veAds config', err );
    }
  }


};

},{"./common/debug":5}],27:[function(require,module,exports){
'use strict';

/*\
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  Revision #1 - September 4, 2014
|*|
|*|  https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
|*|  https://developer.mozilla.org/User:fusionchess
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path[, domain]])
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

var docCookies = {
  getItem: function(sKey) {
    if (!sKey) {
      return null;
    }
    return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
  },

  setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
      return false;
    }
    var sExpires = '';
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
          break;
        case String:
          sExpires = '; expires=' + vEnd;
          break;
        case Date:
          sExpires = '; expires=' + vEnd.toUTCString();
          break;
      }
    }
    document.cookie = encodeURIComponent(sKey) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; secure' : '');
    return true;
  },

  removeItem: function(sKey, sPath, sDomain) {
    if (!this.hasItem(sKey)) {
      return false;
    }
    document.cookie = encodeURIComponent(sKey) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '');
    return true;
  },

  hasItem: function(sKey) {
    if (!sKey) {
      return false;
    }
    return (new RegExp('(?:^|;\\s*)' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=')).test(document.cookie);
  },

  keys: function() {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
      aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
    }
    return aKeys;
  }
};


/**
 * Exports `cookies`
 */

module.exports = docCookies;

},{}],28:[function(require,module,exports){
'use strict';
/**
 * @module `store/store`
 *
 * Forked from https://github.com/marcuswestin/store.js/blob/master/store.js
 *
 * Used to support ie7+ with localStorage
 */


// Store.js
var store = {},
	win = window,
	doc = win.document,
	localStorageName = 'localStorage',
	scriptTag = 'script',
	storage,
  utils = require( '../common/utils' ),
	useCookies = require('../settings' ).fromObjectConfig('storageAcrossProtocols'),
	cookies = require( './cookies' );


// Constants
var COOKIE_TIME = 60 * 60; // 60 minutes time to store a cookie

store.disabled = false;
store.version = '1.3.17';

store.set = function( key, value ) {};

store.get = function( key, defaultVal ) {};

store.has = function( key ) { return store.get(key) !== undefined; };

store.remove = function( key ) {};

store.clear = function() {};

store.transact = function( key, defaultVal, transactionFn ) {
	if (transactionFn == null) {
		transactionFn = defaultVal;
		defaultVal = null;
	}
	if (defaultVal == null) {
		defaultVal = {};
	}
	var val = store.get(key, defaultVal);
	transactionFn(val);
	store.set(key, val);
};


store.getAll = function() {};

store.forEach = function() {};


store.serialize = function( value ) {
	return JSON.stringify(value);
};

store.deserialize = function( value ) {
  if ( !utils.type('string') ) { return undefined; }

  try {
    return JSON.parse(value);
  }
	catch( e ) { return value || undefined; }
};


/**
 * Functions to encapsulate questionable FireFox 3.6.13 behavior
 *
 * when about.config::dom.storage.enabled === false
 * See https://github.com/marcuswestin/store.js/issues#issue/13
 */

function isLocalStorageNameSupported() {
	try {
    return (localStorageName in win && win[localStorageName]);
  }
	catch( err ) {
    return false;
  }
}

if ( isLocalStorageNameSupported() ) {
	storage = win[localStorageName];

	store.set = function(key, val) {
		if ( utils.type(val, 'undefined') ) {
      return store.remove(key);
    }

		storage.setItem( key, store.serialize(val) );

		if ( useCookies ) {
			cookies.setItem(key, store.serialize(val), COOKIE_TIME);
		}

		return val;
	};


	store.get = function(key, defaultVal) {
		var val = store.deserialize(storage.getItem(key));

		if ( !val ) {
			val = store.deserialize(cookies.getItem(key));
		}

		return (val === undefined ? defaultVal : val);
	};


	store.remove = function(key) {
    storage.removeItem(key);
  };


	store.clear = function() {
    storage.clear();
  };


	store.getAll = function() {
		var ret = {};
		store.forEach(function(key, val) {
			ret[key] = val;
		});
		return ret;
	};


	store.forEach = function(callback) {
		for (var i=0; i<storage.length; i++) {
			var key = storage.key(i);
			callback( key, store.get(key) );
		}
	};


} else if ( doc.documentElement.addBehavior ) {
	var storageOwner,
		storageContainer;

  /**
	 * Since #userData storage applies only to specific paths, we need to
	 * somehow link our data to a specific path.  We choose /favicon.ico
	 * as a pretty safe option, since all browsers already make a request to
	 * this URL anyway and being a 404 will not hurt us here.  We wrap an
	 * iframe pointing to the favicon in an ActiveXObject(htmlfile) object
	 * (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
	 * since the iframe access rules appear to allow direct access and
	 * manipulation of the document element, even for a 404 page.  This
	 * document can be used instead of the current document (which would
	 * have been limited to the current path) to perform #userData storage.
	 */

	try {
		storageContainer = new ActiveXObject( 'htmlfile' );
		storageContainer.open( );
		storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>');
		storageContainer.close();
		storageOwner = storageContainer.w.frames[0].document;
		storage = storageOwner.createElement('div');
	} catch(e) {
		// somehow ActiveXObject instantiation failed (perhaps some special
		// security settings or otherwse), fall back to per-path storage
		storage = doc.createElement('div');
		storageOwner = doc.body;
	}
	var withIEStorage = function(storeFunction) {
		return function() {
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift(storage);
			// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
			// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
			storageOwner.appendChild(storage);
			storage.addBehavior('#default#userData');
			storage.load(localStorageName);
			var result = storeFunction.apply(store, args);
			storageOwner.removeChild(storage);
			return result;
		};
	};

  /**
	 * In IE7, keys cannot start with a digit or contain certain chars.
	 * See https://github.com/marcuswestin/store.js/issues/40
	 * See https://github.com/marcuswestin/store.js/issues/83
   */

	var forbiddenCharsRegex = new RegExp('[!\"#$%&\'()*+,/\\\\:;<=>?@[\\]^`{|}~]', 'g');

	var ieKeyFix = function(key) {
		return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___');
	};


	store.set = withIEStorage(function(storage, key, val) {
		key = ieKeyFix(key);
		if (val === undefined) { return store.remove(key); }
		storage.setAttribute(key, store.serialize(val));
		storage.save(localStorageName);
		return val;
	});


	store.get = withIEStorage(function(storage, key, defaultVal) {
		key = ieKeyFix(key);
		var val = store.deserialize(storage.getAttribute(key));
		return (val === undefined ? defaultVal : val);
	});


	store.remove = withIEStorage(function(storage, key) {
		key = ieKeyFix(key);
		storage.removeAttribute(key);
		storage.save(localStorageName);
	});


	store.clear = withIEStorage(function(storage) {
		var attributes = storage.XMLDocument.documentElement.attributes;
		storage.load(localStorageName);
		while (attributes.length) {
			storage.removeAttribute(attributes[0].name);
		}
		storage.save(localStorageName);
	});


	store.getAll = function(storage) {
		var ret = {};
		store.forEach(function(key, val) {
			ret[key] = val;
		});
		return ret;
	};
	store.forEach = withIEStorage(function(storage, callback) {
		var attributes = storage.XMLDocument.documentElement.attributes;
		for (var i=0, attr; attr=attributes[i]; ++i) {
			callback(attr.name, store.deserialize(storage.getAttribute(attr.name)));
		}
	});
}

try {
	var testKey = '__storejs__';
	store.set(testKey, testKey);
	if ( store.get(testKey) != testKey ) { store.disabled = true; }
	store.remove(testKey);
} catch(e) {
	store.disabled = true;
}
store.enabled = !store.disabled;


/**
 * Exports `store`
 * @type {Object}
 */

module.exports = store;

},{"../common/utils":11,"../settings":26,"./cookies":27}]},{},[15]);
