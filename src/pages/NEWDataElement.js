/**
* Created with veads-script.
* User: josesentis15
* Date: 2015-05-05
* Time: 11:38 AM
* To change this template use Tools | Templates.
*/


/**
 * 
 * DataElement class. Defines the structure of each element to capture on each page object.
 * 
 * @param {String} name - name of the element to capture
 * @param {String} storageName - if the element is in localStorage, the name it will be stored with
 * @param {Array[number]} pageIds - pages that this dataElement is related to
 * @param {String} selector - selector of the desired dom element
 * @param {{String, String}} regex {exclude, include} - regular expression to be applied using exclusion or inclusion.
 * @param {String/Number} defaultVal - in case of not capturing the element, default value.
 * @param {String} mask - if we deal with the value captured in a specific way. Ex: currency.
 * @param {Array[String]} dynamicIdentifiers - If we're in a single form situation, we need to obtain this elements when matching the dynamic identifier.
 */
var DataElement = function(config){
 
  this.name = config.pname;
  this.storageName = config.pstorageName;
  this.pageIds = config.ppageIds;
  this.selector = config.pselector;
  this.regex = config.pregex;
  this.defaultVal = config.pdefaultVal;
  this.mask = config.pmask;
  this.dynamicIdentifiers = config.pdynamicIdentifiers;
}

module.exports = DataElement