// Check if GDMHandler should be called. 

var type = require( './utils/type' ), 
    log = require('bows')('GDM Handler');


// A simple function for launching the GDM script
function launchGDM() {
  log('Launching GDM Script');
  (function(a) { var d = document,c = d.createElement("script");c.async = !0, c.defer = !0, c.src = a, d.getElementsByTagName("head")[0].appendChild(c)})((iatDev = (window.location.href.indexOf("iatDev=1") > -1 || document.cookie.indexOf("iatDev=1") > -1), "//" + (window.location.protocol == "http:" && !iatDev ? "h" : "") + "fp.gdmdigital.com/" + flexId + ".js?r=" + Math.random() * 1e16 + '&m=992&a=' + flexId + (iatDev ? "&d=1" : "")));
}

module.exports = {
  start: function(config) {
    if ( !type(config, 'object') ) return;
    if (config.exclude) return;
    
    launchGDM(config.flexId);
  }
}; 