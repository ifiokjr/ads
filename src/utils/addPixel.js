// Add a pixel to the page. 
// 

function appendPixel( pixelPath ) {
  var pixel = document.createElement('img');
  pixel.width = 1;
  pixel.height = 1;
  pixel.src = pixelPath;
  pixel.style.visibility = 'hidden';
  document.body.appendChild(pixel);
  
  // To fix a bug where the pixel sometimes adds padding on certain pages
  setTimeout(function() {
    pixel.style.display = 'none';
  }, 1000);
}

module.exports = appendPixel;