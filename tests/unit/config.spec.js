global.chai = require('chai');
chai.should();
global.sinon = require('sinon');
global.VEjQuery = global.jQuery = require('jquery');


// CHAI plugins
var sinonChai = require('sinon-chai');
var chaijQuery = require('chai-jquery');
var chaiThings = require('chai-things');

chai.use(sinonChai);
chai.use(chaijQuery);
chai.use(chaiThings);
