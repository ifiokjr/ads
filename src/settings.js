/**
* Settings that may be called at any time during the app runtime
*/

module.exports = {


  /**
   * Page Constants
   */

  DEFAULT_PAGE_TYPE: 'custom', // page that we default to.


  /**
   * Main Constants
   */

  MAIN_PAGE_PROPERTY: '_pageObject', // property to store instantiated page.
  MAIN_DATA_ELEMENT: '_dataElementObject',
  MAIN_PIXEL: '_pixelObject',


  /**
   * Element Constants
   */

  ELEMENT_MS: 500, // milliseconds between checks
  ELEMENT_MAX_RETRIES: 1000, // Maximum number of retries


  /**
   * Dynamic way of getting settings from the config object
   *
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  fromObjectConfig: function ( name ) {
    try {
      return window.veTagData.settings.veAds.config[name];
    } catch(err) {
      throw Error( 'Unable to load veAds config');
    }
  }


};
