/**
 * Tests for the main class instatiated to control the whole
 * application.
 */

var Main = require('./main');

describe('Main Runner', function() {
  
  beforeEach(function() {
    this.validObj = helpers.obj();
    this.spy = sinon.spy();
    this.main = new Main(this.validObj);
  });
  
  it('should be instantiated with valid arguments', function() {
    expect(this.main).to.be.an.instanceof(Main);
  });
  
  
  it('should contain an `async` run method which is preferred', function() {
    var spy = sinon.spy(this.main, 'async');
    this.main.run(); // non-blocking
    expect(spy).to.have.been.calledOnce;
  });
  
  
  it('should not fail even when throwing an error within the code')
  
  
  describe('verify veAds object', function() {
    
    it('should properly obtain the veAds object');
  });
  
  
  it('should properly create the page objects', function() {
    helpers.fail();
  });
});