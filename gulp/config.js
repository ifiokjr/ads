var dest = './build';
var src = './src';
var tests = './tests';

var glob = require('glob');

module.exports = {
  browserSync: {
    server: {
      // Serve up our build folder
      baseDir: dest
    }
  },
  markup: {
    src: src + '/htdocs/**',
    dest: dest
  },
  browserify: {
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: src + '/run.js',
      dest: dest,
      outputName: 've-ads.js',
      // list of externally available modules to exclude from the bundle
      external: ['jquery']
    }, {
      entries: src + '/dev.js',
      dest: dest,
      outputName: 've-ads-dev.js',
      // list of externally available modules to exclude from the bundle
      external: ['jquery']
    }, {
      entries: src + '/custom-debug.js',
      dest: dest,
      outputName: 'custom-debug.js',
      // list of externally available modules to exclude from the bundle
      external: ['jquery']
    }]
  },
  production: {
    jsSrc: dest + '/ve-ads.js',
    dest: dest
  }
};
