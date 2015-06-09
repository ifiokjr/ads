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
  var flexId = config.flexId;

  (function(a) {
    var d = document,
      c = d.createElement('script');
    c.async = !0, c.defer = !0, c.src = a, d.getElementsByTagName('head')[0].appendChild(c);
  })((iatDev = (window.location.href.indexOf('iatDev=1') > -1 || document.cookie.indexOf('iatDev=1') > -1), '//' + (window.location.protocol == 'http:' && !iatDev ? 'h' : '') + 'fp.gdmdigital.com/'+ flexId +'.js?r=' + Math.random() * 1e16 + '&m=992&a='+ flexId + (iatDev ? '&d=1' : '')))

  return false;
}
