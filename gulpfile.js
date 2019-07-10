const { src , dest , watch , parallel } = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const minifyCSS = require('gulp-csso');
const concat = require('gulp-concat');
const del = require('del');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
const rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var mode = require('gulp-mode')();

//var localScreenshots = require('gulp-local-screenshots');

var browserSync = require('browser-sync').create();

var config = {
    sourcemaps: 'maps',
    pug: {
        src: 'src/**/*.pug',
        dest: 'opt/www'
    },
    sass: {
        src: 'src/scss/**/*.scss',
        dest: 'opt/www'
    },
    useref: {
        src: 'src/*.html',
        dest: 'opt/www'
    },
    javascript: {
        src: [
            'node_modules/bootstrap/dist/js/bootstrap.min.js',
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/tether/dist/js/tether.min.js',
            'src/js/**/*.js'
            ],
        dest: 'opt/www'
    },
    phpCode: {
        src: [
            'src/php/**/*.php',
        ],
        dest: 'opt/www'
    },
    translations: {
        src: [
            'src/languages/**/*.po',
        ],
        dest: 'opt/www/languages'
    },
    images: {
        src: 'src/images/**/*.+(png|jpeg|jpg|gif|svg)',
        dest: 'opt/www/img'
    },
    fonts: {
        src: 'src/fonts/**/*',
        dest: 'opt/www/fonts'
    },
    browserSync: {
        baseDir: 'build'
    },
    nodeModulesDir: '../../node_modules/'
};

function html() {
    return src(config.pug.src)
        .pipe(pug())
//        .pipe(rename({ extname: '.php'}))
        .pipe(dest(config.pug.dest));
}

function css() {
    // return src('src/scss/*.scss')
    //     .pipe(sass())
    //     .pipe(minifyCSS())
    //     .pipe(dest('build/css'))
    return src(config.sass.src)
        .pipe((mode.development(sourcemaps.init())))
        .pipe(sass({
            style: 'compressed',
            loadPath: [
                config.sass.src,
                config.nodeModulesDir + 'bootstrap/scss/'
            ]
        }).on('error', sass.logError))
        .pipe((mode.development(sourcemaps.write())))
//        .pipe( (mode.development(minifyCSS())))
        .pipe(dest(config.sass.dest));
}

function js() {
    return src(config.javascript.src, { sourcemaps: true })
        .pipe(concat('theme.min.js'))
        .pipe(dest(config.javascript.dest, { sourcemaps: true }))
}
function images(){
    return src(config.images.src)
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(dest(config.images.dest));
}

function phpCode(){
    return src(config.phpCode.src)
        .pipe(dest(config.phpCode.dest));
}

function poFiles(){
    return src(config.translations.src)
        .pipe(dest(config.translations.dest));
}

function clean() {
    return del([
        'opt/www/**/*',
    ]);
}

function browserSync(){
    browserSync.init({
        server: {
            baseDir: config.browserSync.baseDir
        }
    });
}

// function screenshot() {
//     src('build/index.html')
//         .pipe(localScreenshots({
//             width: ['1600', '1000', '480', '320']
//         }))
//         .pipe(dest('build/screenshot.png'));
// }

function watchall() {

    watch(config.pug.src, html); // Pug
    watch(config.sass.src, css); // Sass
    watch(config.javascript.src, js); // Javascript
    watch(config.phpCode.src, phpCode); // phpCode
    // Reloads the browser whenever HTML or JS files changes
    watch('app/*.html', browserSync.reload);
    watch('app/js/**/*.js', browserSync.reload);
}

exports.js = js;
exports.css = css;
exports.html = html;
exports.phpCode = phpCode;
exports.images = images;
//exports.screenshot = screenshot;
exports.poFiles = poFiles;
exports.clean = clean;

exports.browserSync = browserSync;
exports.watch =  parallel(images,html, css, js, phpCode,poFiles ,watchall);
exports.default = parallel(images,html, css, js, phpCode,poFiles );


//gulp.task('default', gulp.series(['clean', 'styles']));
