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
global.fixtures = require('js-fixtures');
fixtures.path = '/tests/fixtures'

// CHAI plugins
var sinonChai = require('sinon-chai');
var chaijQuery = require('chai-jquery');
var chaiThings = require('chai-things');

chai.use(sinonChai);
chai.use(chaijQuery);
chai.use(chaiThings);


// Include the debug module in tests and general work.
global.debugVeAds = require('debug');
