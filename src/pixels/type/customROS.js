var utils = require( '../../common/utils' );


module.exports = {

  ros: {
    needs: [ros],
    produces: []
  }
};




function ros( data, config ) {
  if ( config.type === 'script' && config.src ) {
    utils.getScript( src );
    return false; // no image pixel required
  } else {
    return src;
  }
}
