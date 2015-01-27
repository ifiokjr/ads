var pages = require('../../src/pages');
describe.only('Pages', function() {
  
  it('should export a list of the expected pages', function() {
    pages.list.should.exist;
    
  });
})
