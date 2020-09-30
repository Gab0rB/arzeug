var gulp = require('gulp');
var converterTjs = require('gulp-converter-tjs');
var argv = require('yargs').argv;

gulp.task('default', function () {
  return gulp.src('./files/' + argv.file)
    .pipe(converterTjs())
    .pipe(gulp.dest('./converted_files'));
});