/*
 * Deprecated for debug
 */

var type = require('./type');

function log(message, obj1, obj2) {
  if(veTagData.settings.consoleMessagesEnabled && !type(console, 'undefined')) {
    console.info(message, (obj1 || ''), (obj2 || ''));
  }
}

function safe(message, obj1, obj2) {
  if(veTagData.settings.consoleMessagesEnabled && !type(console, 'undefined')) {
    console.log(message, (obj1 || ''), (obj2 || ''));
  }
}

module.exports = log;
module.exports.safe = safe;