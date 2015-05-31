'use strict';

/**
 * Element Testsuite
 */

var elements = require('./elements');


describe( 'elements' , function( ) {
  var $$, selector;

  beforeEach( function( ) {
    selector = 'body';
    helpers.addToDOM( 'elements' ).html( );
  });


  afterEach( function( ) {
    helpers.clearDOM( );
  });


  it( 'should be able to obtain the value from a plain element', function( ) {
    expect( elements.obtainValue($(selector)) ).to.have.length;
    expect( elements.obtainValue($(selector)) ).to.be.a('string');
  });


  it( 'should also be able to obtain the value from a selector string', function( ) {
    expect( elements.obtainValue(selector) ).to.have.length;
    expect( elements.obtainValue(selector) ).to.be.a('string');
  });


  describe( '#instantCheck', function( ) {
    it( 'should instantly check for an element with #instantCheck', function( ) {
      expect( elements.instantCheck('#instant') ).to.have.text('Instant');
    });
  });


  describe( '#dynamicCheck', function( ) {

    beforeEach( function( ) {
      var dynamic = document.createElement( 'p' )
      dynamic.id = 'dynamic';
      dynamic.innerText = 'Dynamic';

      setTimeout( function( ) {
        document.querySelector('#fixtures').appendChild( dynamic );
      }, 500);

    });


    it( 'should immediately resolve already present elements', function( done ) {
      elements.dynamicCheck('#instant')
      .then( function( $el ) {
        expect( $el ).to.have.text('Instant');
        done( );
      });
    });

    it( 'should find element as soon as it appears', function( done ) {
      elements.dynamicCheck('#dynamic')
      .then( function( $el ) {
        expect( $el ).to.have.text('Dynamic');
        done( );
      });
    });

  });



  describe( '#progressCheck', function( ) {

    var clock;

    beforeEach( function( ) {
      // clock = sinon.useFakeTimers( );
      var progress = document.createElement( 'p' )
      progress.id = 'progress';
      progress.innerText = '';
      var progressArray = [1,2];
      document.querySelector('#fixtures').appendChild( progress );
      var ii=0;

      var progressInterval = setInterval( function( ) {
        if( ii < progressArray.length) {
          progress.innerText += progressArray[ii];
          ii++;
        } else {
          clearInterval( progressInterval );
        }

      }, 500);
    });

    afterEach( function( ) {
      // clock.restore();
    })

    // TODO: Add failure test as well!

    it( 'should check for elements with a progress callback', function( done ) {
      var spy = sinon.spy( ),
          testObject;
      elements.progressCheck( '#progress' )
      .progress( spy )
      .progress( function( $el, obj ) {
        console.log( obj );
        if( obj.value == '12') {
          obj.complete = true; // Should cause the element to stop firing
          testObject = obj;
        }
      })
      .then( function( $el ) {
        expect( spy ).to.have.been.calledThrice; // Test may fail due to race condition
        expect( spy ).to.not.have.been.calledWith( testObject );
        done( );
      });
    });

  });

});
