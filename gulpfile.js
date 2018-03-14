var gulp    = require('gulp'),
	gutil   = require('gulp-util'),
	uglify  = require('gulp-uglifyjs'),
	concat  = require('gulp-concat');
/*
var critical = require('critical');

gulp.task('critical-frontpage', function (cb) {
  critical.generate({
    base: './server/public/',
    src: './assets/html/frontpage.html',
    css: ['./server/public/assets/css/style.css', './server/public/assets/css/materialize.min.css', './server/public/assets/css/jquery-ui.min.css'],
    dimensions: [{
      width: 320,
      height: 480
    },{
      width: 768,
      height: 1024
    },{
      width: 1280,
      height: 960
    }],
    dest: './assets/css/f.c.min.css',
    minify: true,
    extract: false,
    ignore: ['font-face']
  });
});

gulp.task('critical-channel', function (cb) {
  critical.generate({
    base: './server/public/',
    src: './assets/html/embed.html',
    css: ['./server/public/assets/css/style.css', './server/public/assets/css/materialize.min.css', './server/public/assets/css/jquery-ui.min.css'],
    dimensions: [{
      width: 320,
      height: 480
    },{
      width: 768,
      height: 1024
    },{
      width: 1280,
      height: 960
    }],
    dest: './assets/css/c.c.min.css',
    minify: true,
    extract: false,
    ignore: ['font-face']
  });
});


gulp.task('critical-embed', function (cb) {
  critical.generate({
    base: './server/public/',
    src: './assets/html/embed.html',
    css: ['./server/public/assets/css/embed.css', './server/public/assets/css/materialize.min.css', './server/public/assets/css/jquery-ui.min.css'],
    dimensions: [{
      width: 320,
      height: 480
    },{
      width: 768,
      height: 1024
    },{
      width: 1280,
      height: 960
    }],
    dest: './assets/css/e.c.min.css',
    minify: true,
    extract: false,
    ignore: ['font-face']
  });
});
*/
gulp.task('js', function () {
    gulp.src(['server/VERSION.js', 'server/config/api_key.js', 'server/public/assets/js/*.js', '!server/public/assets/js/embed*', '!server/public/assets/js/token*', '!server/public/assets/js/remotecontroller.js', '!server/public/assets/js/callback.js'])
        .pipe(uglify({
        	mangle: true,
            compress: true,
        	enclose: true
        }))
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest('server/public/assets/dist'));
});

gulp.task('embed', function () {
    gulp.src(['server/VERSION.js', 'server/config/api_key.js', 'server/public/assets/js/player.js', 'server/public/assets/js/helpers.js', 'server/public/assets/js/playercontrols.js', 'server/public/assets/js/list.js', 'server/public/assets/js/embed.js', '!server/public/assets/js/frontpage*', '!server/public/assets/js/remotecontroller.js', 'server/public/assets/js/hostcontroller.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('embed.min.js'))
        .pipe(gulp.dest('server/public/assets/dist'));
});

gulp.task('token', function() {
    gulp.src(['server/public/assets/js/token*', 'server/public/assets/js/helpers.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('token.min.js'))
        .pipe(gulp.dest('server/public/assets/dist'));
})

gulp.task('callback', function () {
    gulp.src(['server/VERSION.js', 'server/config/api_key.js', 'server/public/assets/js/callback.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('callback.min.js'))
        .pipe(gulp.dest('server/public/assets/dist'));
});

gulp.task('build', function() {
    gulp.run(['js', 'embed', 'remotecontroller', 'callback', 'token']);
})

gulp.task('remotecontroller', function () {
    gulp.src(['server/VERSION.js', 'server/config/api_key.js', 'server/public/assets/js/remotecontroller.js'])
        .pipe(uglify({
            mangle: true,
            compress: true,
            enclose: true
        }))
        .pipe(concat('remote.min.js'))
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
