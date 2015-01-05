var settings = require('./settings'), 
    gdmHandler = require('./gdmhandler'),
    genieHandler = require('./geniehandler');

// Firstly lets run the gdm handler. 
gdmHandler.start(settings.gdm);


// Now we run the Genie specific tags. 
genieHandler.start(settings.genie);
