(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/index.js":[function(require,module,exports){
var settings = require('./settings'), 
    gdmHandler = require('./gdmhandler');

// Firstly lets run the gdm handler. 
gdmHandler.start();


// Now we run the Genie specific tags. 

},{"./gdmhandler":"/home/codio/workspace/src/gdmhandler.js","./settings":"/home/codio/workspace/src/settings.js"}],"/home/codio/workspace/src/gdmhandler.js":[function(require,module,exports){
// Check if GDMHandler should be called. 

var type = require( './utils/type' );


// A simple function for launching the GDM script
function launchGDM() {
  (function(a) { var d = document,c = d.createElement("script");c.async = !0, c.defer = !0, c.src = a, d.getElementsByTagName("head")[0].appendChild(c)})((iatDev = (window.location.href.indexOf("iatDev=1") > -1 || document.cookie.indexOf("iatDev=1") > -1), "//" + (window.location.protocol == "http:" && !iatDev ? "h" : "") + "fp.gdmdigital.com/" + flexId + ".js?r=" + Math.random() * 1e16 + '&m=992&a=' + flexId + (iatDev ? "&d=1" : "")));
}

module.exports = {
  start: function(config) {
    if ( !type(config, 'object') ) return;
    if (config.exclude) return;
    
    launchGDM(config.flexId);
  }
}; 
},{"./utils/type":"/home/codio/workspace/src/utils/type.js"}],"/home/codio/workspace/src/settings.js":[function(require,module,exports){
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
  }
};
},{}],"/home/codio/workspace/src/utils/type.js":[function(require,module,exports){
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
},{}]},{},["./src/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvZ2RtaGFuZGxlci5qcyIsInNyYy9zZXR0aW5ncy5qcyIsInNyYy91dGlscy90eXBlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgc2V0dGluZ3MgPSByZXF1aXJlKCcuL3NldHRpbmdzJyksIFxuICAgIGdkbUhhbmRsZXIgPSByZXF1aXJlKCcuL2dkbWhhbmRsZXInKTtcblxuLy8gRmlyc3RseSBsZXRzIHJ1biB0aGUgZ2RtIGhhbmRsZXIuIFxuZ2RtSGFuZGxlci5zdGFydCgpO1xuXG5cbi8vIE5vdyB3ZSBydW4gdGhlIEdlbmllIHNwZWNpZmljIHRhZ3MuIFxuIiwiLy8gQ2hlY2sgaWYgR0RNSGFuZGxlciBzaG91bGQgYmUgY2FsbGVkLiBcblxudmFyIHR5cGUgPSByZXF1aXJlKCAnLi91dGlscy90eXBlJyApO1xuXG5cbi8vIEEgc2ltcGxlIGZ1bmN0aW9uIGZvciBsYXVuY2hpbmcgdGhlIEdETSBzY3JpcHRcbmZ1bmN0aW9uIGxhdW5jaEdETSgpIHtcbiAgKGZ1bmN0aW9uKGEpIHsgdmFyIGQgPSBkb2N1bWVudCxjID0gZC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO2MuYXN5bmMgPSAhMCwgYy5kZWZlciA9ICEwLCBjLnNyYyA9IGEsIGQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdLmFwcGVuZENoaWxkKGMpfSkoKGlhdERldiA9ICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKFwiaWF0RGV2PTFcIikgPiAtMSB8fCBkb2N1bWVudC5jb29raWUuaW5kZXhPZihcImlhdERldj0xXCIpID4gLTEpLCBcIi8vXCIgKyAod2luZG93LmxvY2F0aW9uLnByb3RvY29sID09IFwiaHR0cDpcIiAmJiAhaWF0RGV2ID8gXCJoXCIgOiBcIlwiKSArIFwiZnAuZ2RtZGlnaXRhbC5jb20vXCIgKyBmbGV4SWQgKyBcIi5qcz9yPVwiICsgTWF0aC5yYW5kb20oKSAqIDFlMTYgKyAnJm09OTkyJmE9JyArIGZsZXhJZCArIChpYXREZXYgPyBcIiZkPTFcIiA6IFwiXCIpKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzdGFydDogZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgaWYgKCAhdHlwZShjb25maWcsICdvYmplY3QnKSApIHJldHVybjtcbiAgICBpZiAoY29uZmlnLmV4Y2x1ZGUpIHJldHVybjtcbiAgICBcbiAgICBsYXVuY2hHRE0oY29uZmlnLmZsZXhJZCk7XG4gIH1cbn07ICIsIi8qXG4gKlxuICogVGhpcyBtb2R1bGUgaXMgd2hhdCBkZXRlcm1pbmUgdGhlIHNldHRpbmdzXG4gKiBmb3IgZWFjaCBtb2R1bGUgdXNlZCBpbiB0aGUgYXBwbGljYXRpb24uXG4gKi9cbnZhciByYXdTZXR0aW5ncyA9IHdpbmRvdy52ZVRhZ0RhdGEuc2V0dGluZ3MuZ2RtO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2RtOiB7XG4gICAgZXhjbHVkZTogcmF3U2V0dGluZ3MuZXhjbHVkZSxcbiAgICBmbGV4SWQ6IHJhd1NldHRpbmdzLmZsZXhJZFxuICB9LFxuICBnZW5pZToge1xuICAgIGNvbXBsZXRpb25JZDogcmF3U2V0dGluZ3MuY29tcGxldGlvbklkLFxuICAgIGpvdXJuZXlDb2RlOiByYXdTZXR0aW5ncy5qb3VybmV5Q29kZSxcbiAgICBzZWdtZW50SWRzOiByYXdTZXR0aW5ncy5zZWdtZW50SWRzLFxuICAgIG9yZGVySWQ6IHJhd1NldHRpbmdzLm9yZGVySWQsXG4gICAgb3JkZXJWYWx1ZTogcmF3U2V0dGluZ3Mub3JkZXJWYWx1ZSxcbiAgICBjb21wbGV0ZVBhZ2U6IHJhd1NldHRpbmdzLmNvbXBsZXRlUGFnZSxcbiAgfVxufTsiLCIvKipcbiAqIHRvU3RyaW5nIHJlZi5cbiAqL1xudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbi8qKlxuICogUmV0dXJuIHRoZSB0eXBlIG9mIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsLCB0ZXN0VHlwZSkge1xuICBzd2l0Y2godG9TdHJpbmcuY2FsbCh2YWwpKSB7XG4gICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICByZXR1cm4gdGVzdFR5cGUgPT09ICdkYXRlJztcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgcmV0dXJuIHRlc3RUeXBlID09PSAncmVnZXhwJztcbiAgICBjYXNlICdbb2JqZWN0IEFyZ3VtZW50c10nOlxuICAgICAgcmV0dXJuIHRlc3RUeXBlID09PSAnYXJndW1lbnRzJztcbiAgICBjYXNlICdbb2JqZWN0IEFycmF5XSc6XG4gICAgICByZXR1cm4gdGVzdFR5cGUgPT09ICdhcnJheSc7XG4gICAgY2FzZSAnW29iamVjdCBFcnJvcl0nOlxuICAgICAgcmV0dXJuIHRlc3RUeXBlID09PSAnZXJyb3InO1xuICB9XG4gIGlmKHZhbCA9PT0gbnVsbCkgcmV0dXJuIHRlc3RUeXBlID09PSAnbnVsbCc7XG4gIGlmKHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdGVzdFR5cGUgPT09ICd1bmRlZmluZWQnO1xuICBpZih2YWwgIT09IHZhbCkgcmV0dXJuICduYW4nO1xuICBpZih2YWwgJiYgdmFsLm5vZGVUeXBlID09PSAxKSByZXR1cm4gdGVzdFR5cGUgPT09ICdlbGVtZW50JztcbiAgdmFsID0gdmFsLnZhbHVlT2YgPyB2YWwudmFsdWVPZigpIDogT2JqZWN0LnByb3RvdHlwZS52YWx1ZU9mLmFwcGx5KHZhbClcbiAgcmV0dXJuIHRlc3RUeXBlID09PSB0eXBlb2YgdmFsO1xufTsiXX0=
