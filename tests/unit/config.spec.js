/**
 * Configuration module for the tests, run before any tests are run
 */

global.chai = require('chai');
chai.should();

global.expect = chai.expect;

global.sinon = require('sinon');
global.VEjQuery = global.jQuery = $ = require('jquery');


global.helpers = require('./helpers');

global._ = require('lodash');

// CHAI plugins
var sinonChai = require('sinon-chai');
var chaijQuery = require('chai-jquery');
var chaiThings = require('chai-things');

chai.use(sinonChai);
chai.use(chaijQuery);
chai.use(chaiThings);



// This is used for the page tests. 
global.pageConfig = {
    id: 2,
    name: 'Complete Page',
    type: 'conversion',
    inclusionUrls: [{
        url: 'awesome.com/thank-you(/)',
        params: {
          orderId: ':orderId'
        } // named parameter can be obtained from a data object
      },
      'awesome.com/*/cart/'
    ],
    exclusionUrls: [
      
    ],
    dynamicIdentifiers: [{
        id: 1,
        and: 3
      }, // Requires identifier 1 and identifier 3 to be present
      // OR
      {
        id: 5,
        and: null
      } // Requires identifier 5 only.
    ]

  };
