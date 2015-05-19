(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var debug = require('debug'),
    log = debug('mode:debug');
debug.enable('*');

log('Launching application');
require('./main');
},{"./main":7,"debug":2}],2:[function(require,module,exports){

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
  storage = localstorage();

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

},{}],5:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
(function(root, factory) {
  if (('function' === typeof define) && (define.amd != null)) {
    return define([], factory);
  } else if (typeof exports !== "undefined" && exports !== null) {
    return module.exports = factory();
  } else {
    return root.UrlPattern = factory();
  }
})(this, function() {
  var UrlPattern, alphanumericRegex;
  UrlPattern = function(arg) {
    if (arg instanceof UrlPattern) {
      this.isRegex = arg.isRegex;
      this.regex = arg.regex;
      this.names = arg.names;
      return this;
    }
    this.isRegex = arg instanceof RegExp;
    if (!(('string' === typeof arg) || this.isRegex)) {
      throw new TypeError('argument must be a regex or a string');
    }
    if (this.isRegex) {
      this.regex = arg;
    } else {
      this.compile(arg);
    }
    return this;
  };
  UrlPattern.prototype.match = function(url) {
    var bound, captured, i, j, len, match, name, value;
    match = this.regex.exec(url);
    if (match == null) {
      return null;
    }
    captured = match.slice(1);
    if (this.isRegex) {
      return captured;
    }
    bound = {};
    for (i = j = 0, len = captured.length; j < len; i = ++j) {
      value = captured[i];
      name = this.names[i];
      if (value == null) {
        continue;
      }
      if (bound[name] != null) {
        if (!Array.isArray(bound[name])) {
          bound[name] = [bound[name]];
        }
        bound[name].push(value);
      } else {
        bound[name] = value;
      }
    }
    return bound;
  };
  alphanumericRegex = new RegExp('^[a-zA-Z0-9]+$');
  UrlPattern.prototype.isAlphanumeric = function(string) {
    return alphanumericRegex.test(string);
  };
  UrlPattern.prototype.escapeForRegex = function(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };
  UrlPattern.prototype.compile = function(string) {
    var char, enter, index, leave, length, mode, names, openParens, regexString, sliceBegin, that;
    names = [];
    regexString = '^';
    mode = '?';
    sliceBegin = 0;
    openParens = 0;
    that = this;
    index = -1;
    leave = function() {
      switch (mode) {
        case 'variable':
          if ((index - sliceBegin) < 2) {
            throw new Error("`:` must be followed by at least one alphanumeric character that is the variable name at " + index);
          }
          names.push(string.slice(sliceBegin + 1, index));
          regexString += "([a-zA-Z0-9]+)";
          break;
        case 'static':
          regexString += that.escapeForRegex(string.slice(sliceBegin, index));
      }
      return mode = '?';
    };
    enter = function(nextMode) {
      if (nextMode === mode) {
        return;
      }
      leave();
      sliceBegin = index;
      return mode = nextMode;
    };
    length = string.length;
    while (++index < length) {
      char = string.charAt(index);
      if (char === ':') {
        if (mode === 'variable') {
          throw new Error("cannot start variable right after variable at " + index);
        }
        enter('variable');
      } else if (char === '(') {
        leave();
        openParens++;
        regexString += '(?:';
      } else if (char === ')') {
        leave();
        openParens--;
        if (openParens < 0) {
          throw new Error("did not expect ) at " + index);
        }
        regexString += ')?';
      } else if (char === '*') {
        leave();
        regexString += '(.*?)';
        names.push('_');
      } else {
        switch (mode) {
          case 'variable':
            if (!this.isAlphanumeric(char)) {
              enter('static');
            }
            break;
          case '?':
            enter('static');
        }
      }
    }
    if (openParens > 0) {
      throw new Error("unclosed parentheses at " + index);
    }
    leave();
    regexString += '$';
    this.names = names;
    return this.regex = new RegExp(regexString);
  };
  UrlPattern.newPattern = function() {
    throw Error('`urlPattern.newPattern` is no longer supported.  Use `new Pattern` instead.');
  };
  return UrlPattern;
});

},{}],6:[function(require,module,exports){
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
    if(config.exclude || !config.flexId) {
      return;
    }
    launchGDM(config.flexId);
  }
};
},{"./utils/type":21,"debug":2}],7:[function(require,module,exports){
// Load Polyfills
var log = require('debug')('main');



require('./utils/polyfills');

var settings = require('./settings'),
    gdm = require('./gdmhandler'),
    run = require('./run');

log('VERSION: ' + settings.version.join('.')); // Version should be obvious from the logger
log('running gdm handler');
// Firstly lets run the gdm handler. 
gdm.start(settings.gdm);


log('running main code');
// Now we run the Genie specific tags. 
run.start(settings.genie);

},{"./gdmhandler":6,"./run":10,"./settings":11,"./utils/polyfills":19,"debug":2}],8:[function(require,module,exports){
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
},{"./pubsub-js":9,"./settings":11,"./utils/checkElements":14,"./utils/criteria":15,"./utils/jq":16,"./utils/type":21,"./utils/urls":22,"debug":2}],9:[function(require,module,exports){
'use strict';


var PubSub = {};
var messages = {},
  lastUid = -1;

function hasKeys(obj){
  var key;

  for (key in obj){
    if ( obj.hasOwnProperty(key) ){
      return true;
    }
  }
  return false;
}

/**
 *	Returns a function that throws the passed exception, for use as argument for setTimeout
 *	@param { Object } ex An Error object
 */
function throwException( ex ){
  // for now hide errors
  return function reThrowException(){
    if(window.vedebugmode) {
      throw ex;
    }
    
  };
}

function callSubscriberWithDelayedExceptions( subscriber, message, data ){
  try {
    subscriber( message, data );
  } catch( ex ){
    setTimeout( throwException( ex ), 0);
  }
}

function callSubscriberWithImmediateExceptions( subscriber, message, data ){
  subscriber( message, data );
}

function deliverMessage( originalMessage, matchedMessage, data, immediateExceptions ){
  var subscribers = messages[matchedMessage],
    callSubscriber = immediateExceptions ? callSubscriberWithImmediateExceptions : callSubscriberWithDelayedExceptions,
    s;

  if ( !messages.hasOwnProperty( matchedMessage ) ) {
    return;
  }

  for (s in subscribers){
    if ( subscribers.hasOwnProperty(s)){
      callSubscriber( subscribers[s], originalMessage, data );
    }
  }
}

function createDeliveryFunction( message, data, immediateExceptions ){
  return function deliverNamespaced(){
    var topic = String( message ),
      position = topic.lastIndexOf( '.' );

    // deliver the message as it is now
    deliverMessage(message, message, data, immediateExceptions);

    // trim the hierarchy and deliver message to each level
    while( position !== -1 ){
      topic = topic.substr( 0, position );
      position = topic.lastIndexOf('.');
      deliverMessage( message, topic, data );
    }
  };
}

function messageHasSubscribers( message ){
  var topic = String( message ),
    found = Boolean(messages.hasOwnProperty( topic ) && hasKeys(messages[topic])),
    position = topic.lastIndexOf( '.' );

  while ( !found && position !== -1 ){
    topic = topic.substr( 0, position );
    position = topic.lastIndexOf( '.' );
    found = Boolean(messages.hasOwnProperty( topic ) && hasKeys(messages[topic]));
  }

  return found;
}

function publish( message, data, sync, immediateExceptions ){
  var deliver = createDeliveryFunction( message, data, immediateExceptions ),
    hasSubscribers = messageHasSubscribers( message );

  if ( !hasSubscribers ){
    return false;
  }

  if ( sync === true ){
    deliver();
  } else {
    setTimeout( deliver, 0 );
  }
  return true;
}

/**
 *	PubSub.publish( message[, data] ) -> Boolean
 *	- message (String): The message to publish
 *	- data: The data to pass to subscribers
 *	Publishes the the message, passing the data to it's subscribers
**/
PubSub.publish = function( message, data ){
  return publish( message, data, false, PubSub.immediateExceptions );
};

/**
 *	PubSub.publishSync( message[, data] ) -> Boolean
 *	- message (String): The message to publish
 *	- data: The data to pass to subscribers
 *	Publishes the the message synchronously, passing the data to it's subscribers
**/
PubSub.publishSync = function( message, data ){
  return publish( message, data, true, PubSub.immediateExceptions );
};

/**
 *	PubSub.subscribe( message, func ) -> String
 *	- message (String): The message to subscribe to
 *	- func (Function): The function to call when a new message is published
 *	Subscribes the passed function to the passed message. Every returned token is unique and should be stored if
 *	you need to unsubscribe
**/
PubSub.subscribe = function( message, func ){
  if ( typeof func !== 'function'){
    return false;
  }

  // message is not registered yet
  if ( !messages.hasOwnProperty( message ) ){
    messages[message] = {};
  }

  // forcing token as String, to allow for future expansions without breaking usage
  // and allow for easy use as key names for the 'messages' object
  var token = 'uid_' + String(++lastUid);
  messages[message][token] = func;

  // return token for unsubscribing
  return token;
};

/* Public: Clears all subscriptions
 */
PubSub.clearAllSubscriptions = function clearSubscriptions(){
  messages = {};
};

/* Public: removes subscriptions.
 * When passed a token, removes a specific subscription.
 * When passed a function, removes all subscriptions for that function
 * When passed a topic, removes all subscriptions for that topic (hierarchy)
 *
 * value - A token, function or topic to unsubscribe.
 *
 * Examples
 *
 *		// Example 1 - unsubscribing with a token
 *		var token = PubSub.subscribe('mytopic', myFunc);
 *		PubSub.unsubscribe(token);
 *
 *		// Example 2 - unsubscribing with a function
 *		PubSub.unsubscribe(myFunc);
 *
 *		// Example 3 - unsubscribing a topic
 *		PubSub.unsubscribe('mytopic');
 */
PubSub.unsubscribe = function(value){
  var isTopic    = typeof value === 'string' && messages.hasOwnProperty(value),
    isToken    = !isTopic && typeof value === 'string',
    isFunction = typeof value === 'function',
    result = false,
    m, message, t;

  if (isTopic){
    delete messages[value];
    return;
  }

  for ( m in messages ){
    if ( messages.hasOwnProperty( m ) ){
      message = messages[m];

      if ( isToken && message[value] ){
        delete message[value];
        result = value;
        // tokens are unique, so we can just stop here
        break;
      }

      if (isFunction) {
        for ( t in message ){
          if (message.hasOwnProperty(t) && message[t] === value){
            delete message[t];
            result = true;
          }
        }
      }
    }
  }

  return result;
};

module.exports = PubSub;
},{}],10:[function(require,module,exports){
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


// Add the ROS to the site when not on completion or product page. 
function createROSPixel (config) {
  var srcIb, srcSecure;
  
  srcIb = pixelSrc.ros(config.segmentIds);
  srcSecure = pixelSrc.ros(config.segmentIds, true);
  
  addPixel(srcIb);
  addPixel(srcSecure);
    
  logROS('ROS Pixel added to the site.');
}

function createDbmROSPixel (config) {
  var params = {
    src: config.dbm.src,
    cat: config.dbm.cat.ros
  };
  
  srcDbm = pixelSrc.dbm.ros(params);
  
  
  addPixel(srcDbm);
    
  logROS('DBM ROS Pixel added to the site.');
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

// LISTENERS
var listeners = {
  value: PubSub.subscribe('page.value', subscribers.value),
  id: PubSub.subscribe('page.id', subscribers.id),
  product: PubSub.subscribe('page.product', subscribers.product),
  basket: PubSub.subscribe('page.basket', subscribers.basket),
  complete: PubSub.subscribe('page.complete', subscribers.complete)
};





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


// Export this regex into another file.
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
  

  
  var itemString = createBasketString($productPriceEl, itemStringCallback);
  var idList = createBasketString($productIdEl, idListCallback);
  
  
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


// Create a list of product names from an element.
// Blue%20Bag|Red%20Shoes|Green%20Coat
function idListCallback($el, len) {
  var idList = '';
  $el.each(function (idx, el) {
    var val = checkElement.getValOrText($(el));
    
    // run through basket regex here. Using `regexReplacementFromElement`
    val = encodeURIComponent(val);
    idList += val + (idx < (len - 1) ? '|' : '');
  });
  return idList;
}


// Item string to generate a string that looks like
// PROD1:7.99|PROD2:4.99|PROD3:12.99
function itemStringCallback($el, len) {
  var itemString = '';
  $el.each(function (idx, el) {
    var val = checkElement.getValOrText($(el));
    val = masks.currency(val);
    itemString += 'PROD' + (idx + 1) + ':' + val + (idx < (len - 1) ? '|' : '');
  });
  return itemString;
}


// This function allows us to create a string from the basket page using the 
// function passed in as a second parameter. 
// [:TODO] Regex check needs to be perfomed
function createBasketString($el, fn) {
  if(!$el || !$el.length || !fn ) {return '';}
  
  var len = $el.length;
  if (!len) {return '';}
  return fn($el, len); // return the value generated from the callback function  
}


},{"./pages":8,"./pubsub-js":9,"./settings":11,"./utils/addPixel":13,"./utils/checkElements":14,"./utils/criteria":15,"./utils/jq":16,"./utils/pixelSrc":18,"./utils/store":20,"./utils/type":21,"./utils/urls":22,"debug":2}],11:[function(require,module,exports){
/*
 *
 * This module is what determine the settings
 * for each module used in the application.
 * 
 */

var rawSettings = window.veTagData.settings.gdm;

module.exports = {
  gdm: rawSettings.gdm || {
    exclude: rawSettings.exclude,
    flexId: rawSettings.flexId,
    gdmConversionCode: rawSettings.gdmConversionCode,
    gdmSegementId: rawSettings.gdmSegementId
  },
  genie: {
    gdmConversionCode: rawSettings.gdmConversionCode,
    gdmSegementId: rawSettings.gdmSegementId || rawSettings.gdmSegmentId,
    completionId: rawSettings.completionId,
    journeyCode: rawSettings.journeyCode,
    segmentIds: rawSettings.segmentIds,
    orderId: rawSettings.orderId,
    orderValue: rawSettings.orderValue,
    completePage: rawSettings.completePage,
    ros: rawSettings.ros,
    basketPages: rawSettings.basketPages,
    productPages: rawSettings.productPages,
    dbm: rawSettings.dbm || {} // fallback for older versions that don't have this
  },
  dbm: rawSettings.dbm,
  namespace: 'veapps.' + (rawSettings.flexId || '') + (rawSettings.journeyCode || '') + '.GDM.',
  version: [1,3,1]
};
},{}],12:[function(require,module,exports){
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

	module.exports = store;

})(Function('return this')());

},{}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
// Check to see if element exists if not keep checking every second until it is found. 
var log = require('debug')('checkElement'),
    type = require('./type'),
    $ = require('./jq');

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
  return calledInterval; // allow the interval to be cleared;
}

function checkElement(selector, successFn) {
  var $el, found = false;
  
  
  
  if ( type(successFn, 'function') ) {
  
    // when not immediately found behave in an asynchronous way. 
    var calledInterval = interval(null, null, function() {
      if( found === true ) {
        clearInterval(calledInterval);
        return;
      }
      $el = $(selector);
      if($el.length) {
        found = true;
        log('Success function is about to be called');
        clearInterval(calledInterval);
        successFn($el);
        return $el;
      }
      return false;
    });
  }
  
  
  $el = $(selector);
  if($el.length) {
    found = true;
    log('Success function is about to be called');
    if ( type(successFn, 'function') ) {
      clearInterval(calledInterval);
      successFn($el);
    } else {
      return $el;
    }
  }
  return $el;
  
  
}

module.exports = {
  
  check: function( selector, successFn ) {
    log('Element is being checked');
    return checkElement(selector, successFn);
  },
  
  // Keep checking in case an element updates. 
  // Should only be called once the element is present.
  // Checks occur every two seconds.
  checkUpdates: function( selector, oldVal, changedFn) {
    if ( changedFn == null ) {
      changedFn = oldVal;
      oldVal = '';
    }
    
    var stop, $el, newVal;
    var calledInterval = interval(500, 2000, function() {
      $el = $(selector);
      newVal = getValOrText($el);
      if(!type(newVal, 'nan') && !type(newVal, 'null') &&
         !type(newVal, 'undefined') && (newVal !== oldVal) ) {
        
        oldVal = newVal;
        stop = changedFn($el, newVal);
        
        if( stop ) {
          clearInterval( calledInterval );
          return true;
        }
        
      }
    });
  },
  
  getValOrText: getValOrText
 
  
};


function getValOrText($el) {
  if ( type($el, 'string') ) { $el = $($el); }
  return $el.length ? ($el.val() && $el.val().trim()) || ($el.text() && $el.text().trim()) : '';
}
},{"./jq":16,"./type":21,"debug":2}],15:[function(require,module,exports){
var type = require('./type');

var criteria = {
  
  contains: function(str, value) {
    str = String(str.toLowerCase());
    return str.indexOf(String(value).toLowerCase()) > -1;
  },
  
  equal: function(str, value) {
    return String(str) === String(value);
  },
  
  not: function(str, value) {
    return String(str).indexOf(String(value)) === -1;
  },
  
  // Always returns true
  yesPlease: function () {
    return true;
  }
  
};

var masks = {
  
  number: function( str ) {
    var num = String(str).match(/([\d]{4,25})/);
    return num[1];
  },
  
  alphanumeric: function( str ) {
    var alpha = String(str).match(/([\dA-Z]{4,25})/);
    return alpha[1];
  },
  
  currency: function ( str ) {
    return String(str).replace(/[^0-9\.,]/g, '');
  },
  
  doNothing: function (str) {
    return String(str);
  }
};

module.exports = {
  criteria: criteria,
  masks: masks
};
},{"./type":21}],16:[function(require,module,exports){
module.exports = window.VEjQuery || window.$;
},{}],17:[function(require,module,exports){
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
},{"./type":21}],18:[function(require,module,exports){
/**
 * This is a file for automatically generating the relevant pixels for our code.
 */
var SECURE = (window.location.protocol || 'https:') === 'https:' ? true : false,
    $ = require('./jq'),
    type = require('./type'),
    log = require('./log');


module.exports = {
  ros: function(segmentIds, secure) {
    if(secure) {
      return '//secure.adnxs.com/seg?add=' + (segmentIds[2] || segmentIds[0]) + '&t=2';
    } else {
      return '//ib.adnxs.com/seg?add=' + (segmentIds[2] || segmentIds[0]) + '&t=2';
    }
  },
  
  product: function(segmentIds, secure) {
    if(secure) {
      return '//secure.adnxs.com/seg?add=' + segmentIds[0] + '&t=2';
    } else {
      return '//ib.adnxs.com/seg?add=' + segmentIds[0] + '&t=2';
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
  },
  
  appnexus: function(config) {
    return config;
  },
  
  
  dbm: {
    
    // Generate the dbm ros src tag
    ros: function(params) {
      var axel = Math.random() + '';
      var a = axel * 10000000000000;
      var base = 'https://ad.doubleclick.net/activity;src=';
      
      return base +
        params.src + ';type=invmedia;cat=' +
        params.cat + ';ord=' +
        a + '?';

    },
    
    // Generate the dbm conversion pixel
    conversion: function(params) {
      var base = 'https://ad.doubleclick.net/activity;src=';
      return base +
        params.src + ';type=sales;cat=' +
        params.cat + ';qty=[Quantity];cost=' +
        params.orderValue + ';ord=' +
        params.orderId + '?';
    }
  }
  
  
  
  
};
},{"./jq":16,"./log":17,"./type":21}],19:[function(require,module,exports){
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

// Trim polyfill for ie7 and ie8
if (!String.prototype.trim) {
  (function() {
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function() {
      return this.replace(rtrim, '');
    };
  })();
}
},{"./type":21}],20:[function(require,module,exports){
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



if(window.JSON && type(window.JSON.parse, 'function') && type(window.JSON.stringify, 'function')) {
  store = require('../store');
  storage = store.enabled ? store : noStorage;
} else {
  storage = (STORAGE_SUPPORTED || (STORAGE_SUPPORTED = supportStorage(method))) ? simpleStorage : noStorage;
}


module.exports = storage;
},{"../store":12,"./type":21}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
var urlPattern = require('url-pattern'),
    log = require('debug')('urls'),
    $ = require('./jq');


var PAGE_URL = cleanUrl(window.location.hostname + ( (window.location.pathname.length > 1) ? window.location.pathname : '' )), // strip out just '/'
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
  testPattern = testPattern.toLowerCase();
  var pattern = urlPattern.newPattern(testPattern);
  var match = !!pattern.match(PAGE_URL);
  log( 'Result of URLs matching ' + testPattern + ' is', match );
  return match;
}


function checkParamsMatch(params) {
  var match = true;
  if(!Object.size(params)) {
    return match;
  }
  // loop through the params and make sure they are in the pageParams
  // for (key in pageParams)
  // TODO: Add support for splats [DONE]
  $.each(params, function(key, value) {
    key = String(key);
    value = String(value);
    var pattern = urlPattern.newPattern(value);
    if((PAGE_PARAMS[key] == null) || !(pattern.match(PAGE_PARAMS[key]) || pattern.match(decodeURIComponent(PAGE_PARAMS[key])))) {
      match = false;
    }
  });
  // log( 'Result of parameters matching is', match );
  return match;
}

module.exports = {
  
  test: function(pattern, params) {
    return checkURLMatches(pattern) && checkParamsMatch(params);
  }
  
};
},{"./jq":16,"debug":2,"url-pattern":5}]},{},[1]);
