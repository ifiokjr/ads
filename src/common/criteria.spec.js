'use strict';

/**
 * Criteria Tests
 */


var criteria = require( './criteria' );

describe( 'Criteria', function( ) {

  describe('#always', function () {

    it( 'should always return true regardless of parameters', function () {
      expect( criteria.always(Error) ).to.equal( true );
      expect( criteria.always(false) ).to.equal( true );
    });

  });

  describe('#equal', function () {

    it( 'should match case insensitive strings', function ( ) {
      expect( criteria.equal('testing Equal', 'Testing equal') ).to.equal( true );
    });

    it( 'should take a non string and still match', function() {
      expect( criteria.equal(1, '1') ).to.equal( true );
    });

    it( 'should only match exactly when passing true', function ( ) {
      expect( criteria.equal('testing Equal', 'Testing equal', true) ).to.equal( false );
      expect( criteria.equal( 'test', 'test', true) ).to.equal( true );
    });

  });

  describe('#notEqual', function () {

    it('should not be the same as equal', function () {
      expect( criteria.notEqual('test', 'TEST') ).to.not
        .equal( criteria.contains( 'test', 'TEST') );
    });

  });

  describe('#contains', function () {

    it('should match case insensitive strings within value', function ( ) {
      expect( criteria.contains('test', 'this is a TesT') ).to.equal( true );
    });

    it( 'should take a non string and still match', function() {
      expect( criteria.contains(1, '123123') ).to.equal( true );
    });

    it('should match exact strings within value', function ( ) {
      expect( criteria.contains('test', 'this is a test', true) ).to.equal( true );
      expect( criteria.contains('test', 'this is a Test', true) ).to.equal( false );
    });

  });


  describe('#notContains', function () {

    it('should not be the same as contains', function () {
      expect( criteria.notContains('test', 'this is a TEST') ).to.not
        .equal( criteria.contains( 'test', 'this is a TEST') );
    });

  });







});
