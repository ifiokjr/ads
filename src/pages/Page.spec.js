'use strict';

/**
 * Page Testsuite
 */


var Page = require( './Page' ),
    matcher = require('../common/url-matcher'),
    elements = require( '../common/elements' );


describe( 'Page Class', function( ) {

  describe( 'without dynamicIdentifiers', function( ) {
    var pageObj, config, fn;
    beforeEach(function( ) {
      config = helpers.obj( ).pages[1];
      config.dynamicIdentifiers = [ ];
      pageObj = new Page( config );
      fn = function( ) {};
    });


    it( 'it should be an instance of Page', function( ) {
      expect(pageObj).to.be.an.instanceof(Page);
    });

    it( 'it should have a dynamic property that is false', function( ) {
      expect( pageObj.dynamic ).to.be.false;
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
      page.checkURLs( );
      $.each(config.urls, function( index, url) {
        expect( spy ).to.have.been.calledWith( url );
      });

    });


    it( 'should emit `fail` when the current page doesn\'t match', function( ) {
      var spy = sinon.spy(Page.prototype, 'emit' );
      var page = new Page( config );
      page.checkURLs( );
      expect( spy ).to.have.been.calledWith( 'fail' );
      Page.prototype.emit.restore( );
    });


    it( 'should emit `success` and page id once the current page has been matched', function( ) {
      var spy = sinon.spy( Page.prototype, 'emit' );
      config.dynamicIdentifiers = [ ];
      config.urls = ['**']; // Match everything
      var page = new Page( config );
      page.checkURLs( );
      expect( spy ).to.have.been.calledWith( 'success' );
      Page.prototype.emit.restore( );
    });

  });

  describe( 'with dynamicIdentifiers', function( ) {
    var obj, pageObj, emitSpy;

    beforeEach( function( ) {
      Page.prototype.emit.restore && Page.prototype.emit.restore( );
      obj = helpers.obj( ).pages[1];
      pageObj = new Page( obj );
      emitSpy = sinon.spy( Page.prototype, 'emit' );
    });

    afterEach( function( ) {
      emitSpy.restore( );
    });


    it( 'should identify when dynamic identifiers are provided', function( ) {
      console.log(obj);
      expect( pageObj.dynamic ).to.be.true;
    });


    it( 'should not emit success when there is a dynamic identifier not yet resolved', function( ) {
      obj.urls = ['**']; // Match everything
      pageObj.checkURLs( );
      expect( emitSpy ).not.to.have.been.calledWith( 'success' );
    });


    it( 'should not immediately fail when a dynamicIdentifier is present', function( ) {
      pageObj.urls = ['**']; // Match everything
      pageObj.checkURLs( );
      expect( emitSpy ).to.not.have.been.calledWith( 'fail' );
    });


    describe( 'never fail', function( ) {
      it( 'should never fail when dynamicIdentifier present', function( done ){
        Page.prototype.emit.restore && Page.prototype.emit.restore( );
        var spy = sinon.spy( Page.prototype, 'emit' );
        pageObj.urls = ['**']; // Match everything
        pageObj.checkURLs( );

        setTimeout( function( ) {
          expect( spy ).not.to.have.been.called;
          spy.restore( );
          done( );
        }, 600);
      });
    });



    // TODO: properly implement these tests
    describe( '#runDynamics', function( ) {


      it( 'correctly run with both a string for values and and array', function( done ){
        helpers.fail( );
      });

      it( 'should not run where no selector is provided', function( ){

      });

      it('description', function () {

      });

      it( 'should check the element value on every progress', function( done ) {
        helpers.fail( 'What!' );
      });
    });

  });



});
