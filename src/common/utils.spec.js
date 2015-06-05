/**
* Utils testing
*/

var utils = require( './utils' );
var $ = require( 'jquery' );
// var _ = require('lodash');


describe( 'utils', function( ) {


  describe( 'parseURL', function( ) {
    var url = 'https://awesome.com/awesome?test=me#hash';
    var urlObj;

    beforeEach( function( ) {
      urlObj = utils.parseURL(url);
    });


    it( 'should return an object with same structure as window.location', function( ) {
      expect(urlObj.href).to.equal(url);
      expect(urlObj.hostname).to.equal('awesome.com');
      expect(urlObj.protocol).to.equal('https:');
      expect(urlObj.host).to.equal('awesome.com');
      expect(urlObj.pathname).to.equal('/awesome');
      expect(urlObj.search).to.equal('?test=me');
      expect(urlObj.hash).to.equal('#hash');
      expect(urlObj.query).to.equal('test=me'); // Nice utility for pre-stripping out the `?`
    });
  });


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

  describe( 'jQuery', function( ) {

    it( 'should make jQuery available even when VEjQuery isn\'t available', function( ) {
      var jq = require('./jq');
      expect( jq ).to.exist;
      expect( jq('body') ).to.exist;
    });
  });

  describe( 'object size', function( ) {

    var obj = {1: 'one', two: 'awesome', yo: 'three', quatre: 4};

    it( 'should properly measure the size of an object', function( ) {
      expect( utils.objectLength(obj) ).to.equal(4);
    });
  });

  describe( '#whenAny', function( ) {
    var promiseArray, d1, d2, d3, p1, p2, p3;

    beforeEach( function( ) {
      var d1 = $.Deferred( ),
          d2 = $.Deferred( ),
          d3 = $.Deferred( );
          p1 = d1.promise( ),
          p2 = d2.promise( ),
          p3 = d3.promise( );
      promiseArray = [p1, p2, p3];
      setTimeout( function( ) {
        d1.resolve('d1 resolved')
      }, 0);
    });

    it( 'should correctly resolve with promise arguments', function( done ) {
      utils.whenAny( promiseArray[0], promiseArray[1], promiseArray[2] )
      .done( function (val ) {
        expect( val ).to.equal( 'd1 resolved' );
        done( );
      })
    });


    it( 'should correctly resolve with an array of promises', function( done ) {
      // console.log(p1, p2, p3);
      utils.whenAny( promiseArray )
      .done( function( val ) {
        expect( val ).to.equal( 'd1 resolved' );
        done( );
      });
    });



    it( 'should never resolve when there is nothing to resolve', function( done ) {
      // console.log(p1, p2, p3);
      utils.whenAny( promiseArray.slice(1) )
      .done( function( ) {
        helpers.fail();
        done( );
      });

      setTimeout( done, 10 );
    });
  });


  describe( '#getScript', function ( ) {
    var stub, value, url = 'https://awesome.com' ;

    beforeEach( function( ) {
      stub = sinon.stub( jQuery, 'ajax', function() { return [].slice.call(arguments); } );
      value = utils.getScript( url );
    });

    afterEach( function( ) {
      stub.restore( );
    });

    it('should call the jQuery Ajax Function', function () {
      expect( stub ).to.have.been.calledOnce;
    });

    it( 'should be called with the correct arguments', function() {
      var testObj = { type: 'GET', url: url, data: null, success: undefined,
                      dataType: 'script', cache: true };
      expect( value[0] ).to.eql( testObj );
    });

  });

  // Sends out network request rather than manipulating the DOM in anyway.
  describe( '#getImage', function ( ) {
    var originalImage, pixel, stub
        src = 'https://www.google.com.au/images/srpr/logo11w.png';

    beforeEach( function( ) {
      if(!utils.type(Image, 'function')){
        originalImage = window.Image;
        stub = sinon.stub();
        window.Image = stub;
      } else {
        stub = sinon.stub(window, 'Image');
      }

      pixel = utils.getImage( src );
    });

    afterEach( function( ) {
      if(!utils.type(Image, 'function')){
        window.Image = originalImage;
      } else {
        stub.restore();
      }
    });

    it('should make a call to the image constructor', function ( ) {
      expect( window.Image ).to.have.been.calledOnce;
    });


    it('should return a thennable jQuery promise', function ( ) {
      expect( pixel.then ).to.be.a( 'function' );
      expect( pixel.done ).to.be.a( 'function' );
    });

    // :TODO - non-critical this should be fixed to know for certain that image
    // pixel is being called.
    it.skip('should be resolved once \'GET\' request is sent', function (done) {
      window.Image = originalImage;
      console.log(window.Image);
      pixel.then(function( ){
        expect( arguments.length ).to.equal( 0 );
        done( );
      });
    });

  });

});
