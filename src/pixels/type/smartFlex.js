'use strict';

var log = require('../../common/debug')('ve:pixels:type:smartFlex');

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
  var flexId = config.flexId,
      iatDev;

  var generateScript = function() {
    log('Generating Script');
    (function(e) {
      var t = document,
        n = t.createElement("script");
      n.async = !0, n.defer = !0, n.src = e, t.getElementsByTagName("head")[0].appendChild(n)
    })("//c.vepxl1.net/4-" + flexId + ".js?id=" + flexId + "&m=4")
  }
  
  listenToPageChanges(generateScript);
  generateScript();
  return false;
}

/**
   * Support DOM and window event listeners in IE7+
   * Usage: `eventListener(el, eventName, handler);`
   *
   * @param  {DOMElement} el     - The element to test on
   * @param  {String} eventName  - DOM eventListener
   * @param  {Function} handler  - Callback to run when event occurs
   * @param  {Boolean} bubble    - Whether the event should bubble (true)
   *                               or not (false)
   */

  function eventListener(el, eventName, handler, bubble) {
    if (el.addEventListener) {
      el.addEventListener(eventName, handler, bubble);
    } else {
      el.attachEvent('on' + eventName, function() {
        handler.call(el);
      });
    }
  }


  /**
   * Listen to changes in:
   *  - Page URL through pushState
   *  - Page URL through replaceState
   *  - Hash changes through onhashchange
   *  - Back button via onpopstate
   * 
   * @param  {Function} cb - Scoped function to call when page changes
   */

  function listenToPageChanges(cb) {
    log('Listening to page changes');
    setupStateListeners(window.history, 'push', cb);
    setupStateListeners(window.history, 'replace', cb);
    addEventListener(window, 'hashchange', cb, false);
    addEventListener(window, 'popstate', cb, false);

  }

  /**
   * Every time the state (either push or replace state) is called within an
   * application we want to cause it to also capture products again since the
   * page has likely changed.
   *
   * @param  {DOMObject} history - The global window Object
   * @param  {String} type       - Either push or replace
   * @param  {Function} cb       - Callback function for when state is used
   */

  function setupStateListeners(history, type, cb) {
    var stateString = type + 'State';
    var stateEvent = 'on' + type + 'state';
    var stateType = history[stateString];

    history[stateString] = function(state) {
      if (typeof history[stateEvent] == 'function') {
        history[stateEvent]({state: state});
      }
      log('Setting up stateListener with type: ' + type);
      cb({state: state, event: stateEvent});
      return stateType.apply(history, arguments);
    };
  }
  
  function execROS() {
      
  }