var gulp    = require('gulp'),
	gutil   = require('gulp-util'),
	uglify  = require('gulp-uglifyjs'),
	concat  = require('gulp-concat');

gulp.task('js', function () {
    gulp.src(['public/js/*.js', '!public/js/embed*', '!public/js/remotecontroller.js', '!public/js/callback.js'])
        .pipe(uglify({
        	mangle: true,
            compress: true,
        	enclose: true
        }))
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest('public/dist'));
});

gulp.task('embed', function () {
    gulp.src(['public/js/player.js', 'public/js/helpers.js', 'public/js/playercontrols.js', 'public/js/list.js', 'public/js/embed.js', '!public/js/nochan*', '!public/js/remotecontroller.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('embed.min.js'))
        .pipe(gulp.dest('public/dist'));
});

gulp.task('callback', function () {
    gulp.src(['public/js/callback.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('callback.min.js'))
        .pipe(gulp.dest('public/dist'));
});

/*
gulp.task('nochan', function () {
    gulp.src(['public/js/nochan.js', 'public/js/helpers.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('frontpage.min.js'))
        .pipe(gulp.dest('public/dist'));
});*/

gulp.task('remotecontroller', function () {
    gulp.src(['public/js/remotecontroller.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('remote.min.js'))
        .pipe(gulp.dest('public/dist'));
});

gulp.task('default', function(){
    gulp.watch('public/js/*.js', ['js']);
    gulp.watch('public/js/*.js', ['embed']);
    gulp.watch(['public/js/callback.js', 'public/js/helpers.js'], ['callback']);
    //gulp.watch('public/js/*.js', ['nochan']);
    gulp.watch('public/js/remotecontroller.js', ['remotecontroller']);
});
