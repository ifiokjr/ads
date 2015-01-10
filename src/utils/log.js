var type = require('./type');

function log() {
  if(veTagData.settings.consoleMessagesEnabled && !type(console, 'undefined')) {
    console.info.apply(console, arguments);
  }
}

function safe() {
  if(veTagData.settings.consoleMessagesEnabled && !type(console, 'undefined')) {
    console.log.apply(console, arguments);
  }
}

module.exports = log;
module.exports.safe = safe;