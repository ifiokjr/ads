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