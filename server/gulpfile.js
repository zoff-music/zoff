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
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest('../static/dist'));
});

gulp.task('nochan', function () {
    gulp.src(['../static/js/nochan.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('frontpage.min.js'))
        .pipe(gulp.dest('../static/dist'));
});

gulp.task('remotecontroller', function () {
    gulp.src(['../static/js/remotecontroller.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('remote.min.js'))
        .pipe(gulp.dest('../static/dist'));
});

gulp.task('default', function(){
    gulp.watch('../static/js/*.js', ['js']); 
    gulp.watch('../static/js/nochan.js', ['nochan']);
    gulp.watch('../static/js/remotecontroller.js', ['remotecontroller']);
});