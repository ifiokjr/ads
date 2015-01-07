var type = require('./type');

function log() {
  if(veTagData.settings.consoleMessagesEnabled && !type(console, 'undefined')) {
    console.info.apply(console, arguments);
  }
}

module.exports = log;