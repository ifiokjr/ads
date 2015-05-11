/**
 * 
 * Represents a Page class within the VeAds object. 
 * 
 * A page is central to the way VeAds functions. 
 * @constructor
 * 
 * @param {object} config - takes in an object with configuration attached
 */

function Page(config) {

  this.id = config.id;
  this.pageType = config.pageType;
  this.addresses = config.ppageAddress;
  this.integrations = config.pintegrations;
  this.dataElements = config.pdataElements;
}



module.exports = Page