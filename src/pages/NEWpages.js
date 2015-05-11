/**
* Created with veads-script.
* User: josesentis15
* Date: 2015-05-05
* Time: 11:38 AM
* To change this template use Tools | Templates.
*/


/**
 * pageTypeElements enumeration. We just allow a controlled number of types, as this is thought to work with a switch/case statement.
 * 
 * It's prepared to add as many pages as we want.
 */
var pageTypeElements = {
 
  product:'product',
  basket:'basket',
  home:'home', 
  landing:'landing',
  login_reg:'login_reg',  
  confirmation:'confirmation',
  customPage:'customPage'}

/**
 * 
 * PageAddress class. creation of the address array.
 * 
 * Each address can have its own parameters, or we can set shared parameters
 */
var PageAddress = function(){
 
  this.address = [];
  this.sharedParams = '';
}


PageAddress.prototype.addAddress(url, params){
 
  this.address.push({url:url,params:params});
}
PageAddress.prototype.setGlobalParams(params){
 
  this.sharedParams = params;
}

/**
 * 
 * Page class. Configuration of individual page where a pixel (or more than 1) needs to be placed
 * git add 
 * @param {Number} id - this is a number containing the unique id
 * @param {String} name - this is a string containing the name of the page
 * @param {pageTypeElements} ppageType - one of the closed type of pages.
 * @param {Array[number]} dataElements - Ids of the expected DataElements to be checked on this page. Double binding.
 * @param {PageAddress} ppageAddress - object of the class containing the addresses and the parameters
 */
var Page = function(config){
 /*var Page = function(pid, ppageType,pselector,pdefaultVal,pregex,ppageAddress, pintegrations, pdataElements){*/
 
  this.id = config.id;
  this.name = config.name;                                                                                                                   
  this.pageType = config.pageType;
  this.dataElementIds = config.pdataElementIds;
  this.addresses = config.ppageAddress;
}

module.exports = Page