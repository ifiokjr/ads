var utils = require( '../../common/utils' );


module.exports = {

  ros: {
    needs: [],
    produces: [ros]
  }
};

function ros( data, config ) {
//   console.log(data, config);
  if ( config.type === 'script' && config.src ) {
    utils.getScript( config.src );
    return false; // no image pixel required
  } else {
    return config.src;
  }
}
