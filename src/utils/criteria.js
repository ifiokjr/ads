var criteria = {
  
  contains: function($el, value) {
    return $el.text().indexOf(String(value)) !== -1;
  },
  
  equal: function($el, value) {
    return $el.text() === String(value);
  },
  
  not: function($el, value) {
    return $el.text().indexOf(String(value)) === -1;
  }
  
};


module.exports = criteria;