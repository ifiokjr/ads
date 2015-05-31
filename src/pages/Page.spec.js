/**
 * Testing the page specification
 */


var Page = require( './Page' ),
    matcher = require('../common/url-matcher'),
    
    pageObj, config, fn;


describe( 'Page Class', function( ) {
  
  beforeEach(function( ) {
    config = helpers.obj( ).pages[1];
    pageObj = new Page( config );
    fn = function( ) {};
  });
  
  
  it( 'it should be an instance of Page', function( ) {
    expect(pageObj).to.be.an.instanceof(Page);
  });
  
  
  it( 'should throw an error if called without an obj', function( ) {
    fn = function( ) { new Page( ); };
    expect(fn).to.throw(Error);
    fn = function( ) { new Page('failing string'); };
    expect(fn).to.throw( /need to be called with a configuration object/ );
  });
  
  
  it( 'should store the configuration object to page', function( ) {
    expect( pageObj.config ).to.equal( config ); // The only actual important one
    expect( pageObj.urls ).to.equal( config.urls );
    expect( pageObj.type ).to.equal( config.type );
    expect( pageObj.dynamicIdentifiers ).to.equal( config.dynamicIdentifiers );
    expect( pageObj.name ).to.equal( config.name );

  });
  
  
  it( 'should store matching URLs in an array', function( ) {
    expect( pageObj.matchingURLs ).to.be.an( 'array' );
  });
  
  
  it( 'should have emitter methods', function( ) {
    expect( pageObj ).to.have.property( 'on' );
    expect( pageObj ).to.have.property( 'once' );
    expect( pageObj ).to.have.property( 'off' );
    expect( pageObj ).to.have.property( 'emit' );
  });
  
  
  it( 'should check through all urls', function( ) {
    var spy = sinon.spy(matcher, 'match');
    var page = new Page( config );
    
    $.each(config.urls, function( index, url) {
      expect( spy ).to.have.been.calledWith( url );
    });

  });

  
  it( 'should emit `fail` when the current page doesn\'t match', function( ) {
    var spy = sinon.spy(Page.prototype, 'emit' );
    var page = new Page( config );
    expect( spy ).to.have.been.calledWith( 'fail' );
    spy.restore( );
  });
  
  
  it( 'should emit `success` and page id once the current page has been matched', function( ) {
    var spy = sinon.spy( Page.prototype, 'emit' );
    config.dynamicIdentifiers = [ ];
    config.urls = ['**']; // Match everything
    var page = new Page( config );
    expect( spy ).to.have.been.calledWith( 'success' );
    spy.restore( );
  });

  
  describe( 'Dynamic Identifiers', function( ) {
    
    it( 'should identify when dynamic identifiers are available', function( ) {
      expect( pageObj ).to.be.true;
    });
  });
  
  
  
});