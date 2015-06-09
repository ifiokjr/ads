/**
 * @module
 *
 * Valid `veAdsObject`
 *
 * Use in tests and reference point for how the actual object should look
 */

var validVeAds = {

  /*
   * This sets some global VeAds configurations settings.
   * Since there are likely to be additional features that crop up, this is subject to change
   */

  config: {

    timeStamp: 'Wed May 06 2015 16:36:48 GMT+1000 (AUS Eastern Standard Time)',

    version: '2.0.0',

    // A random alphanumeric string of characters, used to namespace storage
    // Can be changed in order to clear all stored elements for future updates

    uuid: 'abcd5678',


    /*
     * Rather than inserting img pixels into the DOM it's possible to generate
     *the same request using JavaScript. This is much more performant.
     */

    avoidDOM: false
  },


  /**\
  |**| The new version of our code is page-centric.
  |**| The page types available are listed below.
  |**|
  |**|  - **basket**: grabbing
  |**|  - **conversion**: where conversion pixels are placed
  |**|  - **custom**: for implementing a custom tag based on the integration attached to it or purely capturing data.
  |**|  - **product**:
  |**|  - **category**:
  |**|  - **ros**: This page is auto generated and includes any page that is on the site.
  |**|
  \**/

  pages: [
    {
      /**
       * Used to reference this page by other objects such as the dataElements
       * and pixels override object.
       * @type {Number}
       */

      id: 1,

      /**
       * The name can be anything. It just helps to debug and provide meaningful
       * messages, rather than dealing with IDs'
       * @type {String}
       */

      name: 'Basket Page',
      type: 'basket', // Page where the products in the basket are captured and placed within


      /**
       * URLs can either be a simple string or also have specific parameters
       * that are looked up
       *
       * Matches use `*` wildcards, `:name` named parameters, `**` globs match everything
       * and `(:optional)` optional parameters
       *
       * @type {Array}
       */
      urls: [
        {
          url: 'awesome.com/cart(/)',
          params: {}
        },

        'awesome.com/*/cart/'
      ],

      dynamicIdentifiers: [ ]
    },

    {
      id: 2,
      name: 'Complete Page',
      type: 'conversion',
      urls: [
        {
          url: 'awesome.com/thank-you(/)',
          params: {
            orderId: ':orderId'
          }
        },

        'awesome.com/checkout/complete/'
      ],

      /**
       * Sometimes the URL alone isn't alone to match the current page.
       *
       * In these cases we can provide an array of criteria which can be used to
       * determine whether the page we're on is correct.
       *
       * At the moment this is limited to using DOM elements.
       * This may changed depending on the specification updates.
       *
       * @type {Array}
       */

      dynamicIdentifiers: [
        {
          // jQuery Selector
          selector: '#progress',

          // [contains, equals, notcontains, alwaysMatch{blank}]
          criteria: 'contains',

          // Array of value which can cause matches for this selector
          values: ['Complete Page', 'Página Completa']
        },
        // OR
        {
          selector: '#awesome',
          criteria: 'contains',
          values: ['Yo']
        }
      ]
    },

    {
      id: 3,
      name: 'Custom Page',
      type: 'custom',

      // An empty array will never match.
      urls: [],
      dynamicIdentifiers: []
    },

    {
      id: 4,
      name: 'Product Page',
      type: 'product',
      urls: [],
      dynamicIdentifiers: []
    }
  ],


  /**\
  |**|
  |**|  Responsible for the pixel that is placed on the correct page.
  |**|  types available are ['ve', 'flex', 'dbm', 'appNexus']
  |**|
  |**|  - **ve**: pixel for retargeting it has pixels for pages: [product, conversion, basket, category]
  |**|         hardcoded: journeyCode
  |**|
  |**|  - **flex**: gathering audience data - pixels for pages [ros]
  |**|        hardcoded: flexId
  |**|  - **dbm**: running double click campaigns: pixels for pages [ros, conversion]
  |**|         hardcoded: catROS, catConversion, src
  |**|  - **appNexus**: running segment pixels pixels for pages [ros, product, conversion]
  |**|         hardcoded: segmentROS, segmentProduct, segmentConversion, conversionId
  |**|  - **customROS**: a custom pixel that can be set up for pages [ros]
  |**|         hardcoded: type [img, script], src
  |**|  - **customConversion**: custom pixel for pages [conversion]
  |**|         harcoded: type[img,script], src
  |**|
  \**/

  pixels: [


    /**
     * Pixel configuration: used to instantiate a pixel when on the correct page
     * for doing so.
     *
     *
     * @type {Object}
     *
     * @property {Number} id - used to identify the pixel uniquely
     * @property {String} name - convenience method for easily identifying a pixel (used in tool)
     * @property {String} type - the type of pixel that will be generated as explained above
     * @property {Object} config - hardcoded configurations passed in when configuring
     * @property {Object} overrides - See explanation below.
     */
    {
      id: 1,

      name: 'Main Products Integration',

      type: 've',

      config: {
        journeyCode: 'adsfasdf' // Identifies the website in our backend
      },


      /**
       * Sometimes we only want to fire on certain pages.
       * Without this, it defaults to firing on all pages that have the correct
       * page type.
       *
       * Don't use this unless a client has requested different configurations to
       * be used for the same pixel within one website.
       *
       * At times clients need a different set up for different conversion pixels. In
       * this case we set up two pages, and an overrides object for the relevant pixels
       * referencing the correct page. The tool abstracts this complexity away.
       *
       *
       * @type {Object}
       *
       * @property {Boolean} active - only use the overrides object if it is active
       * @property {Boolean} ros - set to true if it should use it's ROS pixel on all pages
       *                         if there is no ROS implementation then this is ignored.
       * @property {Array} pages - the only pages that this pixel should use
       * @property {Array} data - elements to be used when populating the dynamic parts of src
       *                        	if no length then it defaults to the first dataElement with
       *                        	the correct type.
       */

      overrides: {
        active: true,
        ros: true,
        pages: [1, 2],
        data: [1, 2]
      }
    },

    {
      id: 2,
      type: 'flex',
      config: {
        flexId: '123456' // Used to call in the flex tracking script
      },
      overrides: {}
    },

    {
      id: 3,
      type: 'dbm',
      config: {
        cat: 'asdf',
        src: 'fdas'
      },
      overrides: {}
    },


    {
      id: 4,
      type: 'appNexus',
      config: {
        segmentROS: '111111', // ROS pixel segments
        segmentProduct: '222222', // Product pixel segemnts
        segmentConversion: '333333', // Conversion pixel segments
        conversionId: '654321' // Conversion pixel Id
      },
      overrides: {}
    },

    {
      id: 5,
      type: 'customROS',
      config: {
        type: 'script', // options: ['script'|'img']
        src: 'https://trackingpixels.com/haha?i=can&see=you' // full url with protocol
      },
      overrides: {}
    },

    {
      id: 6,
      type: 'customConversion',
      config: {
        type: 'script', // options: ['script'|'img']
        src: 'https://trackingpixels.com/i/?know=what&you=bought'
      },
      overrides: {}
    }
  ],



  /**\
  |**|  Responsible for collecting relevant data from DOM selectors, JavaScript variables,
  |**|  localStorage. Linked to a page and can be required.
  |**|  Run using a getter and setter methodology.
  |**|  Pixels, get, while Pages, set.
  |**|
  |**|  - **orderId**: single value
  |**|  - **orderVal**: single value
  |**|  - **productId**: single value
  |**|  - **idList**: list value
  |**|  - **itemString**: list value
  |**|  - **currency**: single value uses the mappings extensively
  |**|
  |**|  @property {Number} id - if this is ever changed you will need to reset the uuid
  |**|  @property {String} name - convenience property for human readability
  |**|  @property {String} type - the type used
  |**|  @property {Array} pages - the pages which this element will be active on
  |**|  @property {Object} regex - more information available below
  |**|  @property {}
  |**|  @property {Object} mapping - more documentation to come :TODO
  |**|  @property {Object} capture - everything to
  |**|
  \**/


  dataElements: [
    {
      id: 1,

      name: 'Order Value',

      type: 'orderVal', // ['orderId', 'orderVal', 'productId', 'idList', 'itemString', 'currency', 'other']

      pages: [ 1 ],

      fallback: '10', // any value set to __timestamp__ for a timestamp to be used.


      /**
       * Used to match certain parts of a value and run before mappinsg
       *
       * @type {Object}
       *
       * @property {Array} include - run the regex through each
       * @property {Array} exclude - runs each regex string and strips everything matched
       */

      regex: {
        include: [ ';kj;k' ], // Matches are run first
        exclude: [ '' ] // Exclude whatever is matched here
      },


      mask: 'currency', // [number, alphanumeric, currency, symbol, nothing]

      /**
       * The key is replaced by the value. This transformation is run
       * last.
       *
       * @type {Object}
       * @property {String} [CUSTOM] - user defined
       */

      mapping: {
        'GBP': '',
        'AUD': '$'
      },



      /**
       * Configuration for what is being captured on the site.
       *
       * @type {Object}
       *
       * @property {String} type - options [ selector, globalVariable, dataLayer, dataLayerReverse, url ]
       * @property {Boolean} useMappings - can be set to transform values via mappings
       */
      capture: {
        type: 'selector',
        useMappings: false,
        mappingCriteria: 'contains', // [contains, equal]
        element: '#awesome', // depends on capture.type ( either jQuery selector or globalVariable)
        keepChecking: false // will return as soon as it resolves, only for selector
      }

    }

  ]
};

module.exports = validVeAds;
