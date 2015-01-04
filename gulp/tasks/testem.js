var gulp = require('gulp'),
    testem = require('gulp-testem');

gulp.task('testem', function() {
  gulp.src(['']).pipe(testem({
    configFile: 'testem.json'
  }));
});