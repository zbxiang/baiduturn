var gulp                = require('gulp');
var less                = require('gulp-less');
var concat              = require('gulp-concat');
var cleanCss            = require('gulp-clean-css');
var del                 = require('del');
var babel               = require('gulp-babel');
var uglify              = require('gulp-uglify');
var rename              = require('gulp-rename');
var imagemin            = require('gulp-imagemin');
var spriter             = require('gulp-css-spriter');
var base64              = require('gulp-base64');
var browserSync         = require('browser-sync').create();
var reload              = browserSync.reload;
var rev                 = require('gulp-rev');
var revCollector        = require('gulp-rev-collector');
var runSequence         = require('run-sequence');

var src = {
    basePath : './src/',
    less : './src/less/',
    images: './src/images/',
    js : './src/scripts/',
    css : './src/styles/'
};

var build = {
    basePath : './build/',
    css : './build/styles/',
    images : './build/images/',
    js : './build/scripts/'
};


/***************************开发模式****************************/

//开发模式下静态服务器
gulp.task('server:dev',function(){
    browserSync.init({
        server: {
            baseDir : src.basePath,
            index: 'index.html'
        },
        port: 3000
    });

    gulp.watch(src.basePath+'*.html',["html:dev"]);
    gulp.watch(src.less+'*.less',["css:dev"]);
    gulp.watch(src.js+'*.js',["js:dev"]);

    runSequence(['html:dev','css:dev','js:dev']);
});

gulp.task('html:dev',function(){
    gulp.src([src.basePath+'*.html'])
        .pipe(gulp.dest(src.basePath))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('css:dev',function(){
    gulp.src([src.less+'*.less'])
        .pipe(base64({}))
        .pipe(less())
        .pipe(gulp.dest(src.css))
        .pipe(concat('all.css'))
        .pipe(gulp.dest(src.css))
        .pipe(cleanCss())
        .pipe(rename('./all.min.css'))
        .pipe(gulp.dest(src.css))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('js:dev',function(){
    gulp.src([src.js+'*.js','!'+src.js+'all.js','!'+src.js+'all.min.js'])
        .pipe(babel({presets: ['es2015']}))
        .pipe(concat('all.js'))
        .pipe(gulp.dest(src.js))
        .pipe(uglify())
        .pipe(rename('./all.min.js'))
        .pipe(gulp.dest(src.js))
        .pipe(reload({
            stream: true
        }));
});

/***************************生产模式****************************/

//生产模式下的服务器
gulp.task('server:build',function(){
    browserSync.init({
        server: {
            baseDir : build.basePath,
            index: 'index.html'
        },
        port: 3001
    });
    runSequence(['imagesmin','html:build','css:build','js:build'],'rev:build');
});

gulp.task('imagesmin',function(){
    gulp.src(src.images+'*.*')
        .pipe(imagemin())
        .pipe(gulp.dest(build.images))
});

gulp.task('html:build',function(){
    gulp.src(src.basePath+'*.html')
        .pipe(gulp.dest(build.basePath))
});

gulp.task('css:build',function(){
    gulp.src([src.css+'all.min.css'])
        .pipe(rev())
        .pipe(gulp.dest(build.css))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/css/'))
});

gulp.task('js:build',function(){
    gulp.src(src.js + 'all.min.js')
        .pipe(rev())
        .pipe(gulp.dest(build.js))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/js/'))
});

gulp.task('del:build',function(){
    del([
        build.basePath
    ]);
});

gulp.task('rev:build', function(){
    gulp.src(['./rev/**/*.json',build.basePath+'*.html'])
        .pipe( revCollector({}) )
        .pipe( gulp.dest(build.basePath) )
});
