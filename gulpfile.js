var gulp    = require('gulp'),
	gutil   = require('gulp-util'),
	uglify  = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
	concat  = require('gulp-concat');

gulp.task('js', function () {
    return gulp.src(['server/VERSION.js', 'server/config/api_key.js', 'server/public/assets/js/*.js', '!server/public/assets/js/embed*', '!server/public/assets/js/token*', '!server/public/assets/js/remotecontroller.js', '!server/public/assets/js/callback.js'])
    //.pipe(sourcemaps.init())
    .pipe(concat('main.min.js'))
        .pipe(uglify({
        	mangle: true,
            compress: true,
        	enclose: true,
        }))

        //.pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('server/public/assets/dist'));
});

gulp.task('embed', function () {
    return gulp.src(['server/VERSION.js', 'server/config/api_key.js', 'server/public/assets/js/player.js', 'server/public/assets/js/helpers.js', 'server/public/assets/js/playercontrols.js', 'server/public/assets/js/list.js', 'server/public/assets/js/embed.js', '!server/public/assets/js/frontpage*', '!server/public/assets/js/remotecontroller.js', 'server/public/assets/js/hostcontroller.js'])
    //.pipe(sourcemaps.init())
    .pipe(concat('embed.min.js'))
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        //.pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('server/public/assets/dist'));
});

gulp.task('token', function() {
    return gulp.src(['server/public/assets/js/token*', 'server/public/assets/js/helpers.js'])
    //.pipe(sourcemaps.init())
    .pipe(concat('token.min.js'))
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))

        //.pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('server/public/assets/dist'));
})

gulp.task('callback', function () {
    return gulp.src(['server/VERSION.js', 'server/config/api_key.js', 'server/public/assets/js/callback.js'])
    //.pipe(sourcemaps.init())
    .pipe(concat('callback.min.js'))
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))

        //.pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('server/public/assets/dist'));
});

gulp.task('build', function() {
    return gulp.run(['js', 'embed', 'remotecontroller', 'callback', 'token']);
})

gulp.task('remotecontroller', function () {
    return gulp.src(['server/VERSION.js', 'server/config/api_key.js', 'server/public/assets/js/remotecontroller.js', 'server/public/assets/js/helpers.js'])
    ////.pipe(sourcemaps.init())
    .pipe(concat('remote.min.js'))
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))

        //.pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('server/public/assets/dist'));
});

gulp.task('default', function(){
    gulp.watch(['server/VERSION.js', 'server/public/assets/js/*.js'], ['js']);
    gulp.watch(['server/public/assets/js/token*.js', 'server/public/assets/js/helpers.js'], ['token']);
    gulp.watch(['server/VERSION.js', 'server/public/assets/js/*.js'], ['embed']);
    gulp.watch(['server/VERSION.js', 'server/public/assets/js/callback.js', 'server/public/assets/js/helpers.js'], ['callback']);
    //gulp.watch('server/public/assets/js/*.js', ['nochan']);
    gulp.watch(['server/VERSION.js', 'server/public/assets/js/remotecontroller.js'], ['remotecontroller']);
});
