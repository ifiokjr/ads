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
 */
var pageTypeElements = {
 
  product:'product',
  basket:'basket',
  complete:'complete',  
  login_reg:'login_reg',  
  category:'category',
  other:'other'}

/**
 * 
 * PageAddress class. creation of the address array.
 */
var PageAddress = function(){
 
  this.address = [];
}

/**
 * 
 * Each address can have its own parameters, so we bound them together in an array.
 */
PageAddress.prototype.addAddress(url, params){
 
  this.address.push({url:url,params:params});
}

/**
 * 
 * Page class. Configuration of individual page where a pixel (or more than 1) needs to be placed
 * 
 * @param {pageTypeElements} ppageType - one of the closed type of pages.
 * @param {Array[str]} pselector - selector for what needs to be captured on the page.
 * @param {String} pdefaultVal - defaul value if not captured.
 * @param {String} pregex - regular expression to be applied
 * @param {PageAddress} ppageAddress - object of the class containing the addresses and the parameters
 * @param {Number} id - this is a number containing the unique id
 */
var Page = function(ppageType,pselector,pdefaultVal,pregex,ppageAddress, id){
 
  //this.selector = pselector;
  this.pageType = ppageType;
  this.defaultVal = pdefaultVal;
  this.regex = pregex;
  this.addresses = ppageAddress;
  this.id = id;
}

/**
 * 
 * 
 * @params {Array[Stuff]} arrayOfData - All the data elements to be captured
 */ 
Page.prototype.dataElementsInitialization ( arrayOfData ) {
  // run a check for all data elements that run on this page. 
  // and create their objects pushed to this.dataObjects
}



Page.prototype.applyRegex($element){
 
  /**
   * 
   * [:TODO] - to be defined. we could use here regexReplacementFromElement if we want, as 'Page' already contains regex and default
  */
}