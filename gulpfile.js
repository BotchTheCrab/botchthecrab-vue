var gulp = require('gulp'),
    sass = require('gulp-sass')(require('sass')),
    importCss = require('gulp-cssimport'),
    sourcemaps = require('gulp-sourcemaps'),
    browserify = require('browserify'),
    vueify = require('vueify'),
    uglifyify = require('uglifyify'),
    source = require('vinyl-source-stream'),
  	buffer = require('vinyl-buffer'),
    concatCss = require('gulp-concat-css'),
    cleanCss = require('gulp-clean-css');

var paths = {
  scripts: {
		root: {
      entries: 'src/js/headmaster.js',
      extensions: ['.js', '.vue'],
      paths: [
        './node_modules',
        './src/js/'
      ]
    },
		sources: [
      'src/js/**/*.js',
      'src/js/**/*.vue'
    ],
		destination: {
			folder: 'deploy/js',
			name: 'ramhorn.js'
		}
	},
	sass: {
		root: 'src/sass/cassette.scss',
		sources: 'src/sass/**/*.scss',
		destination: {
      folder: 'deploy/css'
    }
	},
  css: {
    sources: [
      'node_modules/bootstrap/dist/css/bootstrap.css',
      'node_modules/jquery-ui/themes/smoothness/jquery-ui.css',
      // 'node_modules/fancybox/dist/css/jquery.fancybox.css'
    ],
    destination: {
      folder: 'deploy/css',
      name: 'dependencies.css'
    }
  }
};


////// SASS

gulp.task('Sass-Compile', function(done) {
  gulp.src(paths.sass.root)
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}))
		// .pipe(sass({outputStyle: 'compact'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.sass.destination.folder));
  done();
});

gulp.task('Sass-Watch', function() {
	gulp.watch(paths.sass.sources, gulp.series('Sass-Compile'));
});

gulp.task('Css-Compile', function(done) {
  gulp.src(paths.css.sources)
    .pipe(concatCss(paths.css.destination.name))
    .pipe(cleanCss())
    .pipe(gulp.dest(paths.css.destination.folder));
  done();
});



////// JAVASCRIPT

gulp.task('JavaScript-Bundle', function() {
  return browserify(paths.scripts.root)
    .transform(vueify)
    .transform('uglifyify')
    .bundle()
    .on('error', function() {
      console.log("OH SHIT!");
      this.emit('end');
    })
    .pipe(source(paths.scripts.destination.name))
  	.pipe(buffer())
    .pipe(gulp.dest(paths.scripts.destination.folder));
})

gulp.task('JavaScript-Watch', function() {
	gulp.watch(paths.scripts.sources, gulp.series('JavaScript-Bundle'));
});



////// WATCH and BUILD

gulp.task('build', gulp.parallel('Sass-Compile', 'Css-Compile', 'JavaScript-Bundle'));

gulp.task('sass', gulp.parallel('Sass-Compile'));
gulp.task('css', gulp.parallel('Css-Compile'));
gulp.task('javascript', gulp.parallel('JavaScript-Bundle'));

gulp.task('sass-watch', gulp.parallel('Sass-Watch'));
gulp.task('javascript-watch', gulp.parallel('JavaScript-Watch'));

gulp.task('default', gulp.series('build', gulp.parallel('Sass-Watch', 'JavaScript-Watch')));
