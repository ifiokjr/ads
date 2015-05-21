/** 
 * url-matcher Testsuite
 */

var utils = require('./utils');

var matcher = require('./url-matcher');

var TEST_URL = 'awesome.com/*/:id/(optional)/(:optional)/**';
var PAGE_URL = 'https://awesome.com/help/me/test?param1=one&param2=t%20wo';



var dummyWindowLocation = utils.parseURL(PAGE_URL);


describe( 'matcher object', function( ) {
  
  var sandbox, m, urlObj;
  
  beforeEach( function( ) {
    sandbox = sinon.sandbox.create();
    urlObj = { url: 'awesome.com/:action/*/(:optional)(/)', params: { param1: 'one' } };
    urlObjFail = { url: 'awesome.com/:action/*/(:optional)(/)', params: { param1: 'two' } };
    sandbox.stub(matcher.Matcher.prototype, '_getPageURL', function( ) { return dummyWindowLocation; });
    m = new matcher.Matcher();
  });
  
  afterEach( function( ) {
    sandbox.restore();
  });
  
  
  it( 'should be an instance of the matcher class', function( ) {
    expect( matcher.Matcher ).to.equal( matcher.constructor );
  });
  
  
  it( 'performs a simple url match', function( ) {
    var simpleMatch = m.match('awesome.com/help/me/test');
    expect( simpleMatch[matcher.MATCH_PROPERTY] ).to.be.true;
  });
  
  it( 'still performs the simple URL match even when a protocol is included', function( ) {
    var simpleMatch = m.match('https://www.awesome.com/help/me/test');
    expect( simpleMatch[matcher.MATCH_PROPERTY] ).to.be.true;
  });
  
  it( 'fails when provided a wrong url', function( ) {
    var failingMatch = m.match('awesome.com/help/me/oops');
    expect( failingMatch[matcher.MATCH_PROPERTY] ).to.be.false;
  });
  
  it( 'should properly match `*`', function() {
    var match = m.match('awesome.com/*/me/test');
    expect( match[matcher.MATCH_PROPERTY] ).to.be.true;
    expect( match._[0] ).to.equal( 'help' );
  });
  
  it( 'should properly match `**`', function() {
    var match = m.match('awesome.com/**');
    expect( match[matcher.MATCH_PROPERTY] ).to.be.true;
    expect( match._[0] ).to.equal( 'help/me/test' );
  });
  
  it( 'should properly match `:variable`', function() {
    var match = m.match('awesome.com/:action/me/test');
    expect( match[matcher.MATCH_PROPERTY] ).to.be.true;
    expect( match.action ).to.equal( 'help' );
  });
  
  it( 'should properly match `(optional)` sections', function() {
    var match = m.match('awesome.com/help/(:who)/test');
    expect( match[matcher.MATCH_PROPERTY] ).to.be.true;
    expect( match.who ).to.equal( 'me' );
  });
  
  it( 'should successfully run when passed in an object with parameters', function( ) {
    var match = m.match( urlObj );
    expect( match[matcher.MATCH_PROPERTY] ).to.be.true;
  });
  
  it( 'provides captured parameters correctly', function( ) {
    var match = m.match( urlObj );
    expect( match.action ).to.equal('help');
    expect( match.optional ).to.equal('test');
  });
    
});