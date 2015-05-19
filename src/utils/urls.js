var urlPattern = require('./url-pattern'),
    log = require('debug')('urls'),
    $ = require('./jq');


var PAGE_URL = cleanUrl(window.location.hostname + ( (window.location.pathname.length > 1) ? window.location.pathname : '' )), // strip out just '/'
    PAGE_PARAMS = convertSearchToObject(window.location.search || '');
log('PAGE_URL and PAGE_PARAMS have been set.');

function convertSearchToObject(searchString) {
  if (searchString === '' || searchString === '?') { return {}; }
  var queries, ii, searchObject = {}, split;
  queries = searchString.replace(/^\?/, '').split('&');
  for(ii = 0; ii < queries.length; ii++) {
    split = queries[ii].split('=');
    searchObject[split[0]] = split[1];
  }
  return searchObject;
}


function cleanUrl(dirtyURL) {
  try {
    var url = (dirtyURL + '').toLowerCase();
    url = url.replace('http://', '');
    url = url.replace('https://', '');
    url = url.replace('#', '?');
    url = url.replace(';', '?');
    if( url.substr(0, 4) === 'www.' ) {
      url = url.replace('www.', '');
    }
    return url;
  } catch(err) {
    return '';
  }
}


function checkURLMatches(testPattern) {
  if(testPattern.substr(0, 4) === 'www.') {
    testPattern = testPattern.replace('www.', '');
  }
  testPattern = testPattern.toLowerCase();
  var pattern = urlPattern.newPattern(testPattern);
  var match = !!pattern.match(PAGE_URL);
  log( 'Result of URLs matching ' + testPattern + ' is', match );
  return match;
}


function checkParamsMatch(params) {
  var match = true;
  if(!Object.size(params)) {
    return match;
  }
  // loop through the params and make sure they are in the pageParams
  // for (key in pageParams)
  // TODO: Add support for splats [DONE]
  $.each(params, function(key, value) {
    key = String(key);
    value = String(value);
    var pattern = urlPattern.newPattern(value);
    if((PAGE_PARAMS[key] == null) || !(pattern.match(PAGE_PARAMS[key]) || pattern.match(decodeURIComponent(PAGE_PARAMS[key])))) {
      match = false;
    }
  });
  // log( 'Result of parameters matching is', match );
  return match;
}

module.exports = {
  
  test: function(pattern, params) {
    return checkURLMatches(pattern) && checkParamsMatch(params);
  }
  
};