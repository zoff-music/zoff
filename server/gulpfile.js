var gulp    = require('gulp'),
	gutil   = require('gulp-util'),
	uglify  = require('gulp-uglifyjs'),
	concat  = require('gulp-concat');

gulp.task('js', function () {
    gulp.src(['../static/js/*.js', '!../static/js/nochan*', '!../static/js/remotecontroller.js'])
        .pipe(uglify({
        	mangle: true,
        	compress: true,
        	enclose: true
        }))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('../static/build-js'));
});

gulp.task('default', function(){
    gulp.watch('../static/js/*.js', ['js']); 
});