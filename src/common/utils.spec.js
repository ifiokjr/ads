/**
* Utils testing
*/

var utils = require( './utils' );
var $ = require( 'jquery' );
// var _ = require('lodash');


describe( 'utils', function( ) {

  
  describe( 'type', function( ) {
    var obj = { object: { a:'a' }, string: 'string', number: 100, nan: 0/0, 'null':null,
               error: new Error(),  array: [1,2], element: document.createElement('img'),
               regexp: /lkjlkj/g };
    
    it( 'should have a type function', function( ) {
      expect( utils.type ).to.be.a( 'function' );
    });
 
    
    it( 'should return the correct string when passed in with only one parameter', function( ) {
      $.each( obj, function( key, val ) {
        expect( utils.type(val) ).to.equal( key );
      });
    });

    
    it( 'should return a boolean of true when passed in with two parameters', function( ) {
      $.each( obj, function( key, val ) {
        expect( utils.type(val, key) ).to.equal( true );
      });
    });
    
    
    it( 'should return a boolean of false when passed in with two parameters and the type is wrong', function( ) {
      
      $.each( obj, function( key, val ) {
        expect( utils.type(val, 'wrong') ).to.equal( false );
      });
    });
    
  });
  
  
});