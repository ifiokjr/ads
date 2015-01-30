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
    var calledInterval = interval(2000, 1000, function() {
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