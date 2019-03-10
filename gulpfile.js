var gulp    = require('gulp'),
	gutil   = require('gulp-util'),
	uglify  = require('gulp-uglify'),
    //sourcemaps = require('gulp-sourcemaps'),
    gutil = require('gulp-util'),
	concat  = require('gulp-concat'),
    cssnano = require('gulp-cssnano');

gulp.task('css', function() {
    return gulp.src('server/public/assets/css/style.css')
        .pipe(cssnano({
            preset: ['default', {
                discardComments: {
                    removeAll: true,
                },
            }]
        }))
        .pipe(gulp.dest('server/public/assets/dist'));
});

gulp.task('css-embed', function() {
    return gulp.src('server/public/assets/css/embed.css')
        .pipe(cssnano({
            preset: ['default', {
                discardComments: {
                    removeAll: true,
                },
            }]
        }))
        .pipe(gulp.dest('server/public/assets/dist'));
});

gulp.task('js', function () {
    return gulp.src(['server/VERSION.js', 'server/config/api_key.js', 'server/public/assets/js/*.js', '!server/public/assets/js/embed*', '!server/public/assets/js/token*', '!server/public/assets/js/remotecontroller.js', '!server/public/assets/js/callback.js'])
    //.pipe(sourcemaps.init())
    .pipe(concat('main.min.js'))
        .pipe(uglify({
        	mangle: true,
            compress: true,
        	enclose: true,
        }))
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        //.pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('server/public/assets/dist'));
});

gulp.task('embed', function () {
    return gulp.src(['server/VERSION.js', 'server/config/api_key.js', 'server/public/assets/js/player.js', 'server/public/assets/js/functions.js', 'server/public/assets/js/helpers.js', 'server/public/assets/js/playercontrols.js', 'server/public/assets/js/list.js', 'server/public/assets/js/embed.js', '!server/public/assets/js/frontpage*', '!server/public/assets/js/remotecontroller.js', 'server/public/assets/js/hostcontroller.js'])
    //.pipe(sourcemaps.init())
    .pipe(concat('embed.min.js'))
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
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
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })

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
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })

        //.pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('server/public/assets/dist'));
});

gulp.task('build', done => {
    gulp.series('css', 'css-embed', 'js', 'embed', 'remotecontroller', 'callback', 'token')();
    done();
});

gulp.task('remotecontroller', function () {
    return gulp.src(['server/VERSION.js', 'server/config/api_key.js', 'server/public/assets/js/remotecontroller.js', 'server/public/assets/js/helpers.js'])
    ////.pipe(sourcemaps.init())
    .pipe(concat('remote.min.js'))
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })

        //.pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('server/public/assets/dist'));
});

gulp.task('default', function(){
    gulp.watch(['server/VERSION.js', 'server/public/assets/js/*.js'], ['js']);
    gulp.watch(['server/public/assets/css/*.css'], ['css']);
    gulp.watch(['server/public/assets/css/*.css'], ['css-embed']);
    gulp.watch(['server/public/assets/js/token*.js', 'server/public/assets/js/helpers.js'], ['token']);
    gulp.watch(['server/VERSION.js', 'server/public/assets/js/*.js'], ['embed']);
    gulp.watch(['server/VERSION.js', 'server/public/assets/js/callback.js', 'server/public/assets/js/helpers.js'], ['callback']);
    //gulp.watch('server/public/assets/js/*.js', ['nochan']);
    gulp.watch(['server/VERSION.js', 'server/public/assets/js/remotecontroller.js'], ['remotecontroller']);
});
