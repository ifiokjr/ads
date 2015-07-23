/**
 * Type customPage
 */

'use strict';

var utils = require( '../../common/utils' );
var $ = require( '../../common/jq' );
var log = require( '../../common/debug' )('ve:pixels:type:customPage');


module.exports = {

  custom: {
    needs: [],
    produces: [custom]
  }
};

function custom( data, config, pageID ) {
  log('Checking customPage Pixel', utils.type(config.pages, 'array'), $.inArray(pageID, config.pages));
  if ( utils.type(config.pages, 'array') && ($.inArray(pageID, config.pages) === -1) ) {
    
    return false;
  }
  
  if ( config.type === 'script' && config.src ) {
    utils.getScript( config.src );
    return false; // no image pixel required
  } else {
    return config.src;
  }
}
