global.chai = require('chai');
// chai.should();

global.expect = chai.expect;

global.sinon = require('sinon');
global.VEjQuery = global.jQuery = require('jquery');


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
    name: 'Product Page',
    pageType: 'product', 
    adresses:{
      address : [{
        url:'http://dummyplace.com/*/',
        params:[{'session':'mysession'}]
      },{
        url:'http://dummyplace.com/*/',
        params:[{'session':'mysession'}]       
      }],
      sharedParams = [{}]    
    },
    dataElementIds:[1,2]
  };

 global.dataElements = [{
    id: 1,
    name: 'Product Code',
    pages: [2],
    selector: '#productBox .pName',
    regex: '',
    defaultVal: 'pName',
    mask,: '',
    dynamicIdentifiers: ''//Don't know which shape will it have    
   },
   {id: 2,
    name: 'Unit Price',
    pages: [2],
    selector: '#productBox .price',
    regex: '[0-9]',
    defaultVal: 1.00,
    mask,: 'currency',
    dynamicIdentifiers: ''    
  }];