/**
 * Settings that may be called at any time during the app runtime
 */

var log = require('./common/debug')('ve:settings');

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

  ELEMENT_MS: 750, // milliseconds between checks
  ELEMENT_MAX_RETRIES: 3000, // Maximum number of retries


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
      log( 'Unable to load veAds config', err );
    }
  }


};
