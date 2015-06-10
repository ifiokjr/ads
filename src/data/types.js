/**
 * Type of dataElements and whether they store lists or single values.
 * @type {Object}
 */

var types = {

  orderId: 'single',
  orderVal: 'single',
  productId: 'single',
  idList: 'list', // from basket page and category pages (limited to 5)
  itemString: 'list', // from basket and category pages
  currency: 'single'
};


/**
 * @exports `types`
 * @type {Object}
 */

module.exports = types;
