var utils = require( '../../common/utils' );
var log = require( '../../common/debug' )('ve:pixels:type:customConversion');


module.exports = {

  conversion: {
    needs: [],
    produces: [conversion]
  }
};




function conversion( data, config ) {
  if ( config.type === 'script' && config.src ) {
    log('adding script to the page');
    utils.getScript( config.src );
    return false; // no image pixel required
  } else {
    return src;
  }
}
