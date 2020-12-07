const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const del = require('del');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const replace = require('gulp-replace');
const imagemin = require('gulp-imagemin');
const plumber = require('gulp-plumber');

const paths = {
  html: {
    src: './dist/**/*.html',
    dest: './dist'
  },
  styles: {
    full: './dist/scss/**/*.scss',
    src: './dist/scss/index.scss',
    dest: './dist/assets/css'
  },
  scripts: {
    src: './dist/js/**/*.js',
    dest: './dist/assets'
  },
};

// Cache busting to prevent browser caching issues
const curTime = new Date().getTime();
const cacheBust = () =>
  gulp
    .src(paths.html.src)
    .pipe(plumber())
    .pipe(replace(/cb=\d+/g, 'cb=' + curTime))
    .pipe(gulp.dest(paths.html.dest));


// Copies all html files
const html =() =>
  gulp
    .src(paths.html.src)
    .pipe(plumber())
    .pipe(gulp.dest(paths.html.dest));

// Convert scss to css, auto-prefix and rename into styles.min.css
const styles = () =>
  gulp
    .src(paths.styles.src)
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer({
      overrideBrowserslist: ['last 2 versions'],
      cascade: false
    }), cssnano()]))
    .pipe(
      rename({
        basename: 'styles',
        suffix: '.min'
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());

// Minify all javascript files and concat them into a single app.min.js
const scripts = () =>
  gulp
    .src(paths.scripts.src)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['@babel/preset-env']
      })
    )
    .pipe(terser())
    .pipe(concat('app.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest));

// Watches all .scss, .js and .html changes and executes the corresponding task
function watchFiles() {
  browserSync.init({
    server: {
      baseDir: './dist'
    },
    notify: false
  });

  gulp.watch(paths.styles.full, styles);
  gulp.watch(paths.scripts.src, scripts).on('change', browserSync.reload);
  gulp.watch('./dist/*.html').on('change', browserSync.reload);
}

const build = gulp.series(
  gulp.parallel(styles, scripts),
  cacheBust
);

const watch = gulp.series(build, watchFiles);

exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;
exports.build = build;
exports.default = build;
