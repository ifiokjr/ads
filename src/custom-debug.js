global.debugVeAds = require( 'debug' ); // Make debug available by default when running tests
global.debugVeAds('ve')('EVERYTHING SHOULD BE WORKING!!!');

global.debugVeAds.enable('*');