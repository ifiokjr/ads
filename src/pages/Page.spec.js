/**
* Testing the page specification
*/

var Page = require('./page');

var pageObj, config;

beforeEach(function() {  
  pageObj = new Page(pageConfig);
});

describe('Page Class', function() {
  it('should have an id which is the number 2', function() {
    console.log(pageObj);
    expect(pageObj.id).to.be.a('number');
    expect(pageObj.id).to.equal(2);
  });
  
  it('should throw an error if the config object is not passed in', function () {
    var fn = function() {new Page();};
    expect(fn).to.throw(Error);
  });
  
});

