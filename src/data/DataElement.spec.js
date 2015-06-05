'use strict';

/**
 * Data Element Tests
 */


 var DataElement = require( './DataElement' );


 describe('DataElement Class', function( ) {


   describe('general setup', function () {
     var element, config, getDataFn, fn;

     beforeEach( function() {
       config = helpers.obj( ).dataElements[1];
       element = new DataElement( config );

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
