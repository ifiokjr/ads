// Load Polyfills
var log = require('debug')('General');
try {
  require('./utils/polyfills');

  var settings = require('./settings'),
      gdmHandler = require('./gdmhandler'),
      genieHandler = require('./geniehandler');
  log('Entering the application');
  // Firstly lets run the gdm handler. 
  gdmHandler.start(settings.gdm);


  // Now we run the Genie specific tags. 
  genieHandler.start(settings.genie);
} catch(e) {
}