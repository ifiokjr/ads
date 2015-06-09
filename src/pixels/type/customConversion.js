var utils = require( '../../common/utils' );


module.exports = {

  conversion: {
    needs: [conversion],
    produces: []
  }
};




function conversion( data, config ) {
  if ( config.type === 'script' && config.src ) {
    utils.getScript( src );
    return false; // no image pixel required
  } else {
    return src;
  }
}
