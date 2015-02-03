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
  }
};