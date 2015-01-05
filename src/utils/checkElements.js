// Check to see if element exists if not keep checking every second until it is found. 

function elementInterval(fn, ms, maxRetries) {
  var runTimes = 0
  var interval = setInterval(function() {
    fn();
    runTimes++;
    if(maxRetries && runTimes >= maxRetries) clearInterval(interval)
  }, ms);
  return interval; // allow the interval to be cleared;
}