var gulp    = require('gulp'),
	gutil   = require('gulp-util'),
	uglify  = require('gulp-uglifyjs'),
	concat  = require('gulp-concat');

gulp.task('server', function() {
    gulp.src(['server/handlers/db.js', 'server/handlers/server.js', 'server/handlers/io.js', 'server/handlers/frontpage.js', 'server/handlers/functions.js', 'server/handlers/chat.js', 'server/handlers/list_change.js', 'server/handlers/list_settings.js', 'server/handlers/list.js', 'server/handlers/suggestions.js'])
        .pipe(concat('index.js'))
        .pipe(gulp.dest('server/'));
});

gulp.task('js', function () {
    gulp.src(['server/public/assets/js/*.js', '!server/public/assets/js/embed*', '!server/public/assets/js/remotecontroller.js', '!server/public/assets/js/callback.js'])
        .pipe(uglify({
        	mangle: true,
            compress: true,
        	enclose: true
        }))
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest('server/public/assets/dist'));
});

gulp.task('embed', function () {
    gulp.src(['server/public/assets/js/player.js', 'server/public/assets/js/helpers.js', 'server/public/assets/js/playercontrols.js', 'server/public/assets/js/list.js', 'server/public/assets/js/embed.js', '!server/public/assets/js/frontpage*', '!server/public/assets/js/remotecontroller.js', 'server/public/assets/js/hostcontroller.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('embed.min.js'))
        .pipe(gulp.dest('server/public/assets/dist'));
});

gulp.task('callback', function () {
    gulp.src(['server/public/assets/js/callback.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('callback.min.js'))
        .pipe(gulp.dest('server/public/assets/dist'));
});

/*
gulp.task('nochan', function () {
    gulp.src(['server/public/assets/js/nochan.js', 'server/public/assets/js/helpers.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('frontpage.min.js'))
        .pipe(gulp.dest('server/public/assets/dist'));
});*/

gulp.task('remotecontroller', function () {
    gulp.src(['server/public/assets/js/remotecontroller.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('remote.min.js'))
        .pipe(gulp.dest('server/public/assets/dist'));
});

gulp.task('default', function(){
    gulp.watch(['server/handlers/*.js', 'router/*.js'], ['server']);
    gulp.watch('server/public/assets/js/*.js', ['js']);
    gulp.watch('server/public/assets/js/*.js', ['embed']);
    gulp.watch(['server/public/assets/js/callback.js', 'server/public/assets/js/helpers.js'], ['callback']);
    //gulp.watch('server/public/assets/js/*.js', ['nochan']);
    gulp.watch('server/public/assets/js/remotecontroller.js', ['remotecontroller']);
});
