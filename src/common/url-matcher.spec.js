/** 
 * url-matcher Testsuite
 */

var utils = require('./utils');

var Matcher = require('./url-matcher');

var TEST_URL = 'awesome.com/*/:id/(optional)/(:optional)/**';
var PAGE_URL = 'https://awesome.com/help';



var dummyWindowLocation = utils.parseURL(PAGE_URL);


describe( 'Matcher', function( ) {
  
  var stub, matcherObj, config;
  
  beforeEach( function( ) {
    stub = sinon.stub(Matcher.prototype, '_getPageURL', function( ) { return dummyWindowLocation; });
    matcherObj = new Matcher( TEST_URL, {'orderId': '*'} );
    console.log(stub);
  });
  
  afterEach( function( ) {
    stub.restore();
  });
  
  it( 'should be able to instantiate objects', function( ) {
    expect( matcherObj ).to.be.an.instanceof( Matcher );
  });
  
  
  it( 'should have a pageURL attribute', function( ) {
    expect(matcherObj.pageURL).to.be.a('string');
  });
  
    
    
});