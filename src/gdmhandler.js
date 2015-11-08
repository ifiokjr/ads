// Check if GDMHandler should be called.

var type = require('./utils/type'),
  log = require('debug')('GDM Handler');
// A simple function for launching the GDM script

var iatDev;

function launchGDM(flexId) {
  'use strict';

  log('Launching GDM Script');
  (function(e) {
    var t = document,
      n = t.createElement("script");
    n.async = !0, n.defer = !0, n.src = e, t.getElementsByTagName("head")[0].appendChild(n)
  })("//c.vepxl1.net/4-" + flexId + ".js?id=" + flexId + "&m=4");
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
