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
 * DataElement class. Defines the structure of each element to capture on each page object.
 * 
 * @param {String} name - name of the element to capture
 * @param {String} storageName - if the element is in localStorage, the name it will be stored with
 * @param {String} selector - selector of the desired dom element
 * @param {{String, String}} regex {exclude, include} - regular expression to be applied using exclusion or inclusion.
 * @param {String/Number} defaultVal - in case of not capturing the element, default value.
 * @param {String} mask - if we deal with the value captured in a specific way. Ex: currency.
 * @param {Array[String] dynamicIdentifiers - If we're in a single form situation, we need to obtain this elements when matching the dynamic identifier.
 */
var DataElement = function(pname, pstorageName, pselector, pregex, pdefaultVal, pmask, pdynamicIdentifiers){
 
  this.name = pname;
  this.storageName = pstorageName;
  this.selector = pselector;
  this.regex = pregex;
  this.defaultVal = pdefaultVal;
  this.mask = pmask;
  this.dynamicIdentifiers = pdynamicIdentifiers;
}


/**
 * 
 * Page class. Configuration of individual page where a pixel (or more than 1) needs to be placed
 * 
 * @param {Number} id - this is a number containing the unique id
 * @param {pageTypeElements} ppageType - one of the closed type of pages.
 * @param {Array[DataElement]} dataElements - Elements containing the data to capture and it's values.
 * @param {PageAddress} ppageAddress - object of the class containing the addresses and the parameters
 */
var Page = function(pid, ppageType,/*pselector,pdefaultVal,pregex,*/ppageAddress, pintegrations, pdataElements){
 
  this.id = pid;
  this.pageType = ppageType;
  this.addresses = ppageAddress;
  this.integrations = pintegrations;
  this.dataElements = pdataElements;
}