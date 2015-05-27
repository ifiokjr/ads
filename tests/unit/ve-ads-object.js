/**
 * Valid 'veAds'
 */

var validVeAds = {
  
  /**
   * This sets some global VeAds configurations settings.
   * Since there are likely to be additional features that crop up, this is subject to change
   */
  
  config: {
    timeStamp: 'Wed May 06 2015 16:36:48 GMT+1000 (AUS Eastern Standard Time)',
    version: '2.0.1',
    
    /**
     * Rather than inserting img pixels into the DOM it's possible to generate
     *the same request using JavaScript. This is much more performant.
     */
    
    avoidDomManipulations: false
  },
  
  /**
   * The new version of our code is page-centric.
   * The page types available are listed below.
   * @information
   *  - **basket**:
   *  - **conversion**: where conversion pixels are placed
   *  - **custom**: for implementing a custom tag based on the integration attached to it or purely capturing data.
   *  - **product**:
   *  - **category**
   *  - **ros**: This page is auto generated and includes any page that is on the site.
   *  - ****
   */
  
  pages: [{
    id: 1,
    name: 'Basket Page', // The name can be anything. It just helps to debug and provide meaningful messages, rather than dealing with IDs'
    type: 'basket', // Page where the products in the basket are captured and placed within
    // URLs can either be a simple string or also have specific parameters that are looked up
    // Matches use `*` wildcards, `:name` _named parameters_ and `(:optional)` optional parameters
    urls: [{
      url: 'awesome.com/cart(/)',
      params: {}
    }, 'awesome.com/*/cart/'],
    dynamicIdentifiers: []
  }, {
    id: 2,
    name: 'Complete Page',
    type: 'conversion',
    urls: [{
      url: 'awesome.com/thank-you(/)',
      params: {
        orderId: ':orderId'
      } // named parameter can be obtained from a data object
    }, 'awesome.com/checkout/complete/'],
    
    dynamicIdentifiers: [{ 
          selector: '#dynamicId',
          criteria: 'contains',
          value: ['Complete Page']
      }, // Requires identifier 1 and identifier 3 to be present
      // OR
      {
        id: 5,
        and: null
      } // Requires identifier 5 only.
    ]
  }, {
    id: 3,
    name: 'Custom Page',
    type: 'custom',
    inclusionUrls: [],
    exclusionUrls: [],
    dynamicIdentifiers: []
  }, {
    id: 4,
    name: 'Product Page',
    type: 'product',
    urls: [],
    dynamicIdentifiers: []
  }],
  /*
   * Responsible for the pixel that is placed on the correct page.
   * types available are ['ve', 'flex', 'dbm', 'appNexus']
   */
  pixels: [{
    id: 1,
    name: 'Main Products Integration',
    type: 've',
    pages: [1, 2], // page types are checked and the relevant tag is then displayed on the page
    rosActive: true, // If this integration has an ROS pixel then this determines whether or not it should be used.
    config: {
      journeyCode: 'adsfasdf'
    }
  }, {
    id: 2,
    type: 'custom',
    pages: [3],
    rosActive: false,
    tagHTML: '<img src="https://g.co/klj?fd=7878&cat=ladf">', // The tag that will be dropped on every matched page.
    tagSrc: ''
  }],
  /*
   * Responsible for collecting relevant data from DOM selectors, JavaScript variables,
   * localStorage. Linked to a page and can be required.
   * Run using a getter and setter methodology.
   * Pixels, get, while Pages, set.
   */
  dataElements: [{
    id: 1,
    name: 'Order Value One',
    type: 'orderVal', // ['orderId', 'orderVal', 'productId', 'idList', 'itemString', 'currency', 'other']
    pagesToRunOn: [1],
    // All regex are placed as strings in the object to make it easier to update
    regex: {
      include: ';kj;k', // Matches are run first
      exclude: '' // Exclude whatever is matched here
    },
    mask: 'number' // [ 'number', 'currency', '' ]
  }],
  /*
   * Used to set up pages to only be active when a certain data element has some given value
   *
   */
  dynamicIdentifiers: [{
    name: '',
    id: 1,
    dataElement: 1,
    value: 'complete',
    criteria: []
  }]
};

module.exports = validVeAds;