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


/** NEW VERSION. REGEX. the parameters should change to obj and noFallback. ideal merging with getVal()
function getValOrText($el,obj) {
  if ( type($el, 'string') ) { $el = $($el); }

   //It can be an ID or a Price. Alphanumeric, can't just set default like in getVal()
   var val, timestamp = (new Date()).getTime();

   if (!$el.length){

     if($el.val() && $el.val().trim()){ val = regexReplacementFromElement( $el, obj.regex, obj['default'], timestamp) ;}
     else { val = $el.text() && $el.text().trim() }

   }else val = '';

  return val;
}*/

/**
 * OLD VERSION. Needs amendment for regex
 */
function getValOrText($el) {
  if ( type($el, 'string') ) { $el = $($el); }

  return $el.length ? ($el.val() && $el.val().trim()) || ($el.text() && $el.text().trim()) : '';
}


/**
  * Obtain the falue from the current page if this is the relevant page.
  */
function getVal ( obj, noFallback ) {
  var $el = $(obj.selector),
      timestamp = (new Date()).getTime();

  if (!$el.length) { return noFallback ? '' : obj['default'] || timestamp; }

  var val = regexReplacementFromElement( $el, obj.regex, obj['default'], timestamp);

  return encodeURIComponent(val);
}


/**
 *
 * Checks value captured with an expression and transforms it with regex.
 *
 * @param {element} $el - domain element with a value or text
 * @param {str} regex - regular expression to transform the value of the element
 * @param {str} fallback - Default value in case previous failures
 * @param {str} lastResort - last alternative. Ex: Timestamp
 */
function regexReplacementFromElement( $el, regex, fallback, lastResort ) {
  regex = type(regex, 'regexp') ? regex : new RegExp('', 'g');
  return ($el.text() && $el.text().trim().replace(regex, '')) ||
      ($el.val() && $el.val().trim().replace(regex, '')) ||
      String( fallback || lastResort );
}
