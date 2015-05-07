GDMHandler = require('../../src/gdmhandler.js');
describe('GDM Handler', function() {
  it('should a callable function', function() {
    GDMHandler.start.should.exist;
  });
});