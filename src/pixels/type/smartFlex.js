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
  var flexId = config.flexId,
    iatDev;

  (function(e) {
    var t = document,
      n = t.createElement("script");
    n.async = !0, n.defer = !0, n.src = e, t.getElementsByTagName("head")[0].appendChild(n)
  })("//c.vepxl1.net/4-" + flexId + ".js?id=" + flexId + "&m=4")
  return false;
}
