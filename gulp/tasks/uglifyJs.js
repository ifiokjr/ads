'use strict';

var gulp    = require('gulp');
var config  = require('../config').production;
var size    = require('gulp-filesize');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('uglifyJs', ['browserify'], function() {
  return gulp.src(config.jsSrc)
    .pipe(uglify())
    .pipe(rename('ve-ads.min.js'))
    .pipe(gulp.dest(config.dest))
    .pipe(size());
});
