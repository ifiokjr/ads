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
      entries: src + '/dev-entry.js',
      dest: dest,
      outputName: 'gdm.dev-entry.js',
      // list of externally available modules to exclude from the bundle
      external: ['jquery']
    }]
  },
  production: {
    jsSrc: dest + '/gdm.js',
    dest: dest
  }
};