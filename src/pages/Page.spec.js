/**
 * Testing the page specification
 */


var Page = require('./Page');
var pageObj, config;


describe('Page Class', function() {
  
  beforeEach(function() {
    pageObj = new Page(pageConfig);
  });
  
  
  it('it should be an instance of Page', function() {
    expect(pageObj).to.be.an.instanceof(Page);
  });
  
  
  it('should have an id which is the number 2 and a name', function() {
    expect(pageObj.id).to.be.a('number');
    expect(pageObj.id).to.equal(2);
    expect(pageObj.name).to.be.a('string');
    expect(pageObj.name).to.equal('Complete Page');
  });
  
  
  it('should throw an error if the config object is not passed in', function() {
    var fn = function() {
      new Page();
    };
    expect(fn).to.
    throw(Error);
  });
  

  it('with incorrect type should result in an error', function() {
    var pageTypes = [ 'product', 'basket', 'conversion', 'custom', 'ros', 'category' ];
    fail();
  });
  
  
  // Added skips to these tests until we can work through how this object should behave. 
  describe.skip('PageAddress', function() {
    
    
    it('should have at least 1 address object', function() {
      expect(pageObj.addresses).to.be.an.instanceof(PageAddress);
    });
    
    
    it('should have at least 1 address with values inside', function() {
      var addLen = pageObj.addresses.adress.length;
      assert(Array.isArray[pageObj.addresses.adress]);
      expect(addLen).to.be.above(0);
      for(var ii = 0; ii < addLen; ii++) {
        assert.isObject(pageObj.addresses.adress[ii]);
        expect(pageObj.addresses.adress[ii].url).to.be.a('string');
      }
    });
    
    
    it('should be related to at least 1 DataElement, and the Id has to be a number', function() {
      var elemLen = pageObj.dataElementIds.length;
      assert(Array.isArray[pageObj.dataElementIds]);
      expect(elemLen).to.be.above(0);
      
      for(var ii = 0; ii < addLen; ii++) {
        assert.isObject(pageObj.dataElementIds[ii]);
        expect(pageObj.dataElementIds[ii]).to.be.a('number');
      }
    });
  });
  
  /*
   describe('Integration', function(){
   });  
 */
  /*describe('DataElement', function(){

     it('Page.dataElements should be an array', function () {

       assert(Array.isArray[pageObj.dataElements]);
     });     
    
     it('Page should have at least 1 DataElement object with values inside', function () {

       var elemLen = pageObj.dataElements.length;

       expect(elemLen).to.be.above(0);

       for(var ii=0;ii<addLen;ii++){

         expect(pageObj.dataElements[ii]).to.be.an.instanceof(DataElement);
         expect(pageObj.dataElements[ii].name).to.be.a('string');
         expect(pageObj.dataElements[ii].selector).to.be.a('string');
         expect(pageObj.dataElements[ii].regex).to.be.a('string');
       }
      });*/
});