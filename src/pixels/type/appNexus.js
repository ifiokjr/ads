'use strict';

module.exports = {

  product: {
    needs: ['productId'],
    produces: [product]
  },

  conversion: {
    needs: ['orderVal', 'orderId', 'currency'],
    produces: [conversion]
  },

  ros: {
    needs: [],
    produces: [ros]
  }

};



function conversion(data, config) {
  return 'https://secure.adnxs.com/px?id=' + config.conversionId +
         '&seg=' + config.segmentConversion + '&order_id=' + data.orderId +
         '&value=' + data.oderVal + '&other=' + data.currency + '&t=2';
}

function ros(data, config) {
  return '//secure.adnxs.com/seg?add=' + config.segmentROS + '&t=2';
}

function product(data, config) {
  return '//secure.adnxs.com/seg?add=' + config.segmentProduct + '&t=2';
}
