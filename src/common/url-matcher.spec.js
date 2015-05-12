/** 
 * url-matcher Testsuite
 */

var utils = require('./utils');

var URLMatcher = require('./url-matcher');

var TEST_URL = 'awesome.com/*/:id/(optional)/(:optional)/**';
var PAGE_URL = 'https://awesome.com/help';



var dummyWindowLocation = utils.parseURL(PAGE_URL);


describe( 'URLMatcher', function( ) {
  
  var stub, matcherObj, config;
  
  beforeEach( function( ) {
    stub = sinon.stub(URLMatcher.prototype, '_getPageURL', function( ) { return dummyWindowLocation; });
    matcherObj = new URLMatcher( TEST_URL, {'orderId': '*'} );
    console.log(stub);
  });
  
  afterEach( function( ) {
    stub.restore();
  });
  
  it( 'should be able to instantiate objects', function( ) {
    expect( matcherObj ).to.be.an.instanceof( URLMatcher );
  });
  
  
  it( 'should have a pageURL attribute', function( ) {
    expect(matcherObj.pageURL).to.be.a('string');
  });
  
  
  it( 'should have the current Page URL as the pageURL attribute', function( ) {
    expect( matcherObj.pageURL ).to.equal( 'awesome.com/help' );
  });
  
  
  
  
  it( 'should update the currentURL attribute when the page URL updates (without refreshing)', function( ) {
    helpers.fail('needs implementing');
  });
  
});