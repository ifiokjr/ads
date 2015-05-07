/**
 * toString ref.
 */
var toString = Object.prototype.toString;
/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api public
 */
module.exports = function(val, testType) {
  switch(toString.call(val)) {
    case '[object Date]':
      return testType === 'date';
    case '[object RegExp]':
      return testType === 'regexp';
    case '[object Arguments]':
      return testType === 'arguments';
    case '[object Array]':
      return testType === 'array';
    case '[object Error]':
      return testType === 'error';
  }
  if(val === null) return testType === 'null';
  if(val === undefined) return testType === 'undefined';
  if(val !== val) return 'nan';
  if(val && val.nodeType === 1) return testType === 'element';
  val = val.valueOf ? val.valueOf() : Object.prototype.valueOf.apply(val)
  return testType === typeof val;
};