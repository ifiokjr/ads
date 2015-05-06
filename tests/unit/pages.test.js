var pages = require('../../src/pages');
var run = require('../../src/run.js');


describe.only('Pages', function() {
  
  it('should export a list of the expected pages', function() {
    pages.list.should.exist;
    
  });
 
 var pageAddress = new pages.PageAddress();
 pageAddress.addAddress('http://examplepage1','');
 
 var page1 = new pages.Page(pageTypeElements['product'],'.example','1.00','regex',pageAddress);
 
 var pageObjects = [];
 pageObjects.push(page1);
 
 run.run(pageObjects);
})
