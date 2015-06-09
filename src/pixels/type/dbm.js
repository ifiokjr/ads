'use strict';

/**
 * @module
 *
 * Provides pixels for [ros, conversion]
 *
 */

module.exports = {

  conversion: {
    needs: ['orderVal', 'orderId', 'idList'],
    produces: [conversion]
  },

  ros: {
    needs: [],
    produces: [ros]
  }
};


function ros( data, config ) {
  var random = (Math.Random() + '') * 10000000000000;
  return 'https://ad.doubleclick.net/ddm/activity/src=' + config.src +
  ';type=invmedia;cat=' + config.catROS + 'iektney2;ord=' + random;
}

function conversion( data, config ) {
  var qty = data.idList && data.idList.length;
  return 'https://ad.doubleclick.net/ddm/activity/src=' + config.src +
  ';type=sales;cat=' + config.catConversion + ';qty=' + data.idList.length +
  ';cost=' + data.orderVal + ';ord=' + data.orderId + '?';
}
