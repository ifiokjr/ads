function log() {
  if(veTagData.settings.consoleMessagesEnabled) {
    console.info(arguments);
  }
}

module.exports = log