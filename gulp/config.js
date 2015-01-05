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
      entries: src + '/index.js',
      dest: dest,
      outputName: 'gdm.js',
      // list of externally available modules to exclude from the bundle
      external: ['jquery']
    }, {
      entries: tests + '/unit/*.js',
      dest: tests,
      outputName: 'compiledTests.js'
    }]
  },
  production: {
    jsSrc: dest + '/*.js',
    dest: dest + '/gdm.min.js'
  }
};