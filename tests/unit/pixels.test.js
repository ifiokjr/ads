'use strict';

var pixel = require('../../src/utils/pixelSrc');


describe('Generating Pixels', function() {
  it('should generate the correct pixel for dbm', function() {
    
    var params = {
      src: '4395913',
      cat: 'l5Yqw3mf',
      orderId: '#546789',
      orderValue: 100.50
    }, src;
    
    src = pixel.dbm(params);
    
    src.should.equal('https://ad.doubleclick.net/activity;src=4395913;type=sales;cat=l5Yqw3mf;qty=[Quantity];cost=100.50;ord=#546789?');
    
  });
});