// Load Polyfills
// 
try {
  require('./utils/polyfills');

  var settings = require('./settings'),
      gdmHandler = require('./gdmhandler'),
      genieHandler = require('./geniehandler');
  console.info('entering the application');
  // Firstly lets run the gdm handler. 
  gdmHandler.start(settings.gdm);


  // Now we run the Genie specific tags. 
  genieHandler.start(settings.genie);
} catch(e) {
}