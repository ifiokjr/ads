'use strict';

/**
 * Pixel Class tests
 */

var Pixel = require( './Pixel' );


describe('Pixel Class', function( ) {


  describe('general setup', function () {
    var pixel, config, getDataFn, fn;

    beforeEach( function() {
      getDataFn = sinon.stub();
      config = helpers.obj( ).pixels[1];
      pixel = new Pixel( config, getDataFn );

      fn = function( ) { return new Pixel(config); };
    });


    it( 'should be instantiated with a config object and function', function () {
      expect( pixel ).to.be.an.instanceof( Pixel );
    });

    it( 'should throw an error when no function passed in', function () {
      expect( fn ).to.throw( TypeError );
    });


    it( 'should have emitter methods', function( ) {
      expect( pageObj ).to.have.property( 'on' );
      expect( pageObj ).to.have.property( 'once' );
      expect( pageObj ).to.have.property( 'off' );
      expect( pageObj ).to.have.property( 'emit' );
    });

  });

});
