var gulp    = require('gulp'),
	gutil   = require('gulp-util'),
	uglify  = require('gulp-uglifyjs'),
	concat  = require('gulp-concat');

gulp.task('js', function () {
    gulp.src(['server/views/assets/js/*.js', '!server/views/assets/js/embed*', '!server/views/assets/js/remotecontroller.js', '!server/views/assets/js/callback.js'])
        .pipe(uglify({
        	mangle: true,
            compress: true,
        	enclose: true
        }))
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest('server/views/assets/dist'));
});

gulp.task('embed', function () {
    gulp.src(['server/views/assets/js/player.js', 'server/views/assets/js/helpers.js', 'server/views/assets/js/playercontrols.js', 'server/views/assets/js/list.js', 'server/views/assets/js/embed.js', '!server/views/assets/js/frontpage*', '!server/views/assets/js/remotecontroller.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('embed.min.js'))
        .pipe(gulp.dest('server/views/assets/dist'));
});

gulp.task('callback', function () {
    gulp.src(['server/views/assets/js/callback.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('callback.min.js'))
        .pipe(gulp.dest('server/views/assets/dist'));
});

/*
gulp.task('nochan', function () {
    gulp.src(['server/views/assets/js/nochan.js', 'server/views/assets/js/helpers.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('frontpage.min.js'))
        .pipe(gulp.dest('server/views/assets/dist'));
});*/

gulp.task('remotecontroller', function () {
    gulp.src(['server/views/assets/js/remotecontroller.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('remote.min.js'))
        .pipe(gulp.dest('server/views/assets/dist'));
});

gulp.task('default', function(){
    gulp.watch('server/views/assets/js/*.js', ['js']);
    gulp.watch('server/views/assets/js/*.js', ['embed']);
    gulp.watch(['server/views/assets/js/callback.js', 'server/views/assets/js/helpers.js'], ['callback']);
    //gulp.watch('server/views/assets/js/*.js', ['nochan']);
    gulp.watch('server/views/assets/js/remotecontroller.js', ['remotecontroller']);
});
