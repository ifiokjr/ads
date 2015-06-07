'use strict';

/**
 * Data Element Tests
 */


 var DataElement = require( './DataElement' );


 describe('DataElement Class', function( ) {


   describe('general setup', function () {
     var element, config, getDataFn, fn, validObj;

     beforeEach( function() {
       validObj = helpers.obj( );
       helpers.setGlobalVeAdsObj( validObj );
       config = validObj.dataElements[0];
       element = new DataElement( config );
       fn = function() { new DataElement(); };
     });


     it( 'should be instantiated with a config object and function', function () {
       expect( element ).to.be.an.instanceof( DataElement );
     });

     it( 'should throw an error when no function passed in', function () {
       expect( fn ).to.throw( TypeError );
     });


     it( 'should have emitter methods', function( ) {
       expect( element ).to.have.property( 'on' );
       expect( element ).to.have.property( 'once' );
       expect( element ).to.have.property( 'off' );
       expect( element ).to.have.property( 'emit' );
     });


     it('should store all page properties on instantiation', function () {

     });


   });

 });
