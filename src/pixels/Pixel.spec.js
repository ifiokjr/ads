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
      pixel = new Pixel( config, {} );

      fn = function( ) { return new Pixel(config); };
    });


    it( 'should be instantiated with a config object and function', function () {
      expect( pixel ).to.be.an.instanceof( Pixel );
    });

    it( 'should not throw an error when no function passed in', function () {
      expect( fn ).to.not.throw( TypeError );
    });


    it( 'should have emitter methods', function( ) {
      expect( pixel ).to.have.property( 'on' );
      expect( pixel ).to.have.property( 'once' );
      expect( pixel ).to.have.property( 'off' );
      expect( pixel ).to.have.property( 'emit' );
    });

    it( 'should store the config passed in', function ( ) {
      expect(pixel.id).to.equal(config.id);
      expect(pixel.name).to.equal(config.name);
      expect(pixel.type).to.equal(config.type);
      // expect(pixel.settings).to.equal(config);
      // expect(pixel.config).to.equal(config.config);
    });

  });

});
