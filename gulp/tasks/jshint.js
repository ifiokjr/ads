var gulp = require('gulp'),
  jshint = require('gulp-jshint');

gulp.task('lint', function() {
  gulp.src(['./src/**.js', './tests/unit/**.js', './tests/config/**.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});