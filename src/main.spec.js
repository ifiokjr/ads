'use strict';

/**
 * Tests for the main class instatiated to control the whole
 * application.
 */

var Main = require( './main' ),
    settings = require('./settings'),
    Page = require( './pages/Page' );

describe( 'Main Runner', function( ) {
  var main, validObj, fn;

  beforeEach( function( ) {
    validObj = helpers.obj( );
    this.spy = sinon.spy( );
    helpers.setGlobalVeAdsObj( validObj );
    main = new Main( );
    fn = function( ) { return new Main( ); };

  });

  afterEach( function( ) {
    helpers.unsetGlobalVeAdsObj( );
  });

  it( 'should be instantiated without arguments', function( ) {
    expect( main ).to.be.an.instanceof( Main );
  });

  it( 'should have a property called `veAdsConfig`', function( ) {
    expect(main.veAdsConfig).to.be.an('object');
  });

  it( 'should throw an error when there is no valid `veAdsObj`', function( ) {
    helpers.unsetGlobalVeAdsObj();
    expect( fn ).to.throw (Error );
  });


  describe( 'window.JSON', function ( ) {
    var _spy, backup, _main;

    beforeEach( function() {
      _spy = sinon.spy( $, 'getScript' );
      backup = window.JSON;

      window.JSON = undefined;
      _main = new Main( );
      window.JSON = backup;
    });

    afterEach( function( ) {
      _spy.restore( );
    });


    it( 'should check for the existense of window.JSON', function( ) {
      expect( _spy ).to.have.been.calledWith( 'https://cdnjs.cloudflare.com/ajax/libs/json3/3.3.2/json3.min.js' );
    });


    it( 'should store a jQuery promise `jsonPromise` that can be called later in the code', function( ) {
      expect( _main.jsonPromise ).to.have.property('then');
      expect( _main.jsonAvailable ).to.equal( false );
    });

    it( 'should set `jsonAvailable` to true when json in the browser', function( ) {
      expect( main.jsonAvailable ).to.equal( true );
      expect( main.jsonPromise ).to.equal( undefined );
    });

  });



  describe( '#instantiatePages', function( ) {
    var _main, _spy;

    beforeEach( function( ) {
      _spy = sinon.spy( Main.prototype, 'instantiatePages' );
      _main = new Main( );
    });

    afterEach( function( ) {
      _spy.restore();
    });

    it( 'should call this method', function( ) {
      expect( _spy ).to.have.been.called;
    });


    it( 'should store a copy of the instantiated page on each member of the pages object', function( ) {
      $.each( _main.veAdsConfig.pages, function( index, pageObj ) {
        expect( pageObj[settings.MAIN_PAGE_PROPERTY] ).to.be.an.instanceof( Page );
      });
    });


    it( 'should sort each of the pages in the order that they will run', function( ) {
      // use underscore pluck
      var sortedIdArray = _.pluck( _main.veAdsConfig.pages, 'id' );
      expect( sortedIdArray ).to.eql( [0,2,4,1,3] );
    });




  });


  describe( '#setupPageListener', function( ) {
    var page, pageConfig, dataSpy, pixelSpy, shutdownSpy;


    beforeEach( function( ) {
      pageConfig = helpers.obj( ).pages[1];
      page = new Page( pageConfig );
      dataSpy = sinon.spy( main, 'setPageElements' );
      pixelSpy = sinon.spy( main, 'runPagePixels' );
      shutdownSpy = sinon.spy( Page.prototype, 'off' );
      main.setupPageListeners( page );
    });


    afterEach( function( ) {
      dataSpy.restore( );
      pixelSpy.restore( );
      shutdownSpy.restore( );
    });


    it( 'should ensure `setPageElements` is called when `success` is emitted', function () {
      page.emit( 'success' );
      expect( dataSpy ).to.have.been.calledWith( page );
    });


    it( 'should ensure `runPagePixels` is called when `success` is emitted', function () {
      page.emit( 'success' );
      expect( pixelSpy ).to.have.been.calledWith( page );
    });


    it( 'should call `page.off( )` when fail is passed through', function () {
      page.emit( 'fail' );
      expect( shutdownSpy ).to.have.been.called;
      expect( shutdownSpy ).to.have.been.calledWithExactly();
    });


    it( 'should not listen to more than one event', function( ) {
      page.emit( 'success' );
      expect( dataSpy ).to.have.been.calledOnce;
      page.emit( 'success' );
      expect( dataSpy ).to.have.been.calledOnce;
      expect( pixelSpy ).to.have.been.calledOnce;
      page.emit( 'fail' );
      expect( shutdownSpy ).to.have.been.calledWith( 'fail' );
    });

  });


  describe('#setPageElements', function () {
    var page, pageConfig;

    beforeEach( function( ) {
      pageConfig = helpers.obj( ).pages[1];
      page = new Page( pageConfig );
      main.setPageElements(page);
    });

    it.skip('should create data elements', function () {
      expect.fail('Not implemented');
    });
  });

});
