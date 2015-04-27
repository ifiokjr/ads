### VeAds Object

Here is the object that this works with. Must be placed within the VeInteractive Tag

```
gdm = {
  configuration: {
    journeyCode: 'asdfasdf',

    dbm: {
      include: true,
      src: 'iamsrc',
      cat: {
        ros: 'iam-ros-cat',
        conversion: 'iam-conversion-cat'
      },
      ros: true
    },
    
    appNexus: {
      completionId: 10000,
      segmentIds: [100, 200, 300]
    },
    
    flex: {
      include: true,
      ros: true,
      id: '5032'
    }
    
  }, 

  orderId: {
      selector: '#orderId',
      mask: '',
      'regex': /[^0-9]/g,
      page: {
          params: { },
          urls: [  ]
      }
  },
  productPages: {
      selector: '#pp',
      'default': '000000',
      page: {
          params: { page: 'product' },
          urls: [ 'ranger-quiet.codio.io/tests/main.*' ]
      },
      'regex': null
  }, 
  basketPages: {
      selectors: {
          productId: '.productId', 
          productPrice: '.productValue'
      },
      page: {
          params: { page: 'basket' },
          urls: [ 'ranger-quiet.codio.io/tests/main.*' ]
      },
      'regex': null
  },
  orderValue: {
      selector: '.orderValue',
      'default': '1.00',
       mask: '',
      page: {
          params: {  },
          urls: [ 'ranger-quiet.codio.io/tests/main.*' ]
      },
      updates: !!~document.URL.indexOf('updates') ? true : false,
      'regex': /[^0-9,\.]/g
  },


  completePages: [{
      page: {
          params: { page: 'complete'  },
          urls: [ 'ranger-quiet.codio.io/tests/*'  ]                  
      },  

      dynamicIdentifier: { 
          selector: '#dynamicId',
          criteria: 'contains',
          value: ['Complete Page', 'J\'ai ne comprend pas'] // Can now be used for multiple identifiers
      },
      
      overrides: {
        include: true, 
        appNexus: {
          conversion: '100veride',
          segment: '1000',
        }, 
        dbm: {
          cat: 'asdf-override-cat',
          src: 'override-src'
        }
      }
  }]
}
```


### Implementations

- GDM general script [ ]
- URL Matching [ ]
- Checking For Dom Elements - Auto Refresh [ ] 
- saving to Local Storage

#### OPTIONAL
- Genie Extras - purchased items [ ]
- Added Items
- Run of site tracking

```
var settings = {
    gdm: {
        exclude: false, // can be an array of urls for pages to exclude gdm script from
        
        ros: true, 
        
        flexId: '00000', // an alphanumeric string -- REQUIRED
        
        completionId: '', // the genie completion id -- REQUIRED
        
        journeyCode: '', // Genie Journey Code -- REQUIRED
        
        segmentIds: [1,2], // Genie Segment ids
        
        
        
        orderId: {
            selector: '#orderId', // A jQuery Selector for the order ID from the completion page -- REQUIRED (will default to timestamp if left blank)
            mask: 'number', // string from selection of [number, all, capitals]-- OPTIONAL
            regex: /[0-9]/,
        },
        
        productPages: {
            selector: '#product-id', // A jQuery Selector for the productPage ID from the product pages
            default: '0', // The value to use when nothing found -- OPTIONAL
            page: { // the page where this can be stored from (if left blank defaults to completion page) -- OPTIONAL
                params: {},
                urls: ['www.awesome.com/products/*']
            },
            regex: /[0-9]+\.[0-9]+/g
        }, 
        
        basketPages: {
            selectors: {
                productId: 'td>tr', 
                productPrice: 'td>tr:first',
            }
            page: { // the page where this can be stored from (if left blank defaults to completion page) -- OPTIONAL
                params: {},
                urls: ['www.awesome.com/cart']
            },
            regex: /[0-9]/g
        }
        
        orderValue: {
            selector: '#orderValue', // A jQuery Selector for the order ID from the completion or checkout pages (uses localstorage). -- REQUIRED
            default: '0', // The value to use when nothing found -- OPTIONAL
            page: { // the page where this can be stored from (if left blank defaults to completion page) -- OPTIONAL
                params: {
                    checkout: 'true',
                    id: 1
                },
                urls: ['www.awesome.com/checkout/', 'www.awesome.com/checkout/awesome/']
            },
            regex: /[0-9]+\.[0-9]+/
        },
                
        completePage: {
            urls: ['www.awesome.com/completed-yo/*'], // the actual page that will have the image tag implemented on it -- REQUIRED
            params: { // -- OPTIONAL
                completed: 'true',
                id: 2
            },
            dynamicIdentifier: { // if the page isn't unique then an identifier to determine that this is a completed page -- DEFAULT TO NULL
                selector: '#completed',
                criteria: 'contains', // choose from [contains, equals, not, ] -- DEFAULTS TO CONTAINS
                value: 'awesome'
            }
        }
    }
};
```
