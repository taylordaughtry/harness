var basePaths = {
		src: './source',
		dest: './public_html/assets'
	},
	imagemin = require('gulp-imagemin')
	jshint = require('gulp-jshint'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	notify = require('gulp-notify'),
	stylus = require('gulp-stylus'),
	gulp = require('gulp'),
	del = require('del');

gulp.task('clean', function() {
	return del([basePaths.dest, './dist']);
});

gulp.task('scripts', function() {
	return gulp.src([
			basePaths.src + '/harness/js/harness.js',
			basePaths.src + '/js/*.js',
			basePaths.src + '/harness/js/boot.js'
		])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'))
		.pipe(concat('script.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(basePaths.dest + '/js'))
		.pipe(notify(('Scripts compiled successfully.')));
});

gulp.task('styles', function() {
	return gulp.src([
			basePaths.src + '/css/variables.styl',
			basePaths.src + '/harness/css/base.styl',
			basePaths.src + '/css/mixins.styl',
			basePaths.src + '/css/components/*.styl',
			basePaths.src + '/css/modules/*.styl',
		])
		.pipe(concat('style.min.styl'))
		.pipe(stylus({
			compress: true
		}))
		.pipe(gulp.dest(basePaths.dest + '/css'))
		.pipe(notify('Styles compiled successfully.'));
});

gulp.task('images', function() {
	return gulp.src(basePaths.src + '/images/**/*')
		.pipe(imagemin({
			optimizationLevel: 7,
			verbose: true
		}))
		.pipe(gulp.dest(basePaths.dest + '/images'))
		.pipe(notify('Images compiled successfully.'));
});

gulp.task('build', gulp.series('clean', 'scripts', 'styles', 'images'));

gulp.task('watch', function() {
	var watchPaths = [
		basePaths.src + '/harness/js/*.js',
		basePaths.src + '/js/*.js',
		basePaths.src  +'/harness/css/base.styl',
		basePaths.src + '/css/variables.styl',
		basePaths.src + '/css/mixins.styl',
		basePaths.src + '/css/components/*.styl',
		basePaths.src + '/css/modules/*.styl',
		basePaths.src + '/images/**/*'
	];

	gulp.task('build');

	gulp.watch(watchPaths, gulp.task('build'));
});

gulp.task('default', gulp.task('build'));