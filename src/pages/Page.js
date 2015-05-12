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
  this.name = config.name;                                                                                                                   
  this.type = config.type;
  this.dataElementIds = config.pdataElementIds;
  this.addresses = config.ppageAddress;
}

module.exports = Page