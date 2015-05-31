var type = require('./type');

var criteria = {

  contains: function(str, value) {
    str = String(str.toLowerCase());
    return str.indexOf(String(value).toLowerCase()) > -1;
  },

  equal: function(str, value) {
    return String(str) === String(value);
  },

  not: function(str, value) {
    return String(str).indexOf(String(value)) === -1;
  },

  // Always returns true
  yesPlease: function () {
    return true;
  }

};

var masks = {

  number: function( str ) {
    var num = String(str).match(/([\d]{4,25})/);
    return num[1];
  },

  alphanumeric: function( str ) {
    var alpha = String(str).match(/([\dA-Z]{4,25})/);
    return alpha[1];
  },

  currency: function ( str ) {
    return String(str).replace(/[^0-9\.,]/g, '');
  },

  doNothing: function (str) {
    return String(str);
  }
};

module.exports = {
  criteria: criteria,
  masks: masks
};
