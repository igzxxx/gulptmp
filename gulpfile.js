//gulpの読み込み
var gulp = require("gulp");

//プラグイン読み込み
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var browser = require("browser-sync");
var plumber = require("gulp-plumber");
var uglify = require("gulp-uglify");
var imageMin = require("gulp-imagemin");


//htmlを保存後ブラウザを更新
gulp.task("html-reload", function() {
    gulp.src("dest/**/*html")
        .pipe(plumber())
        .pipe(browser.reload({stream:true}));
});

//cssを保存後ベンダープレフィックスの付与、ブラウザ更新
gulp.task("css-reload", function() {
    gulp.src("dest/css/*css")
        .pipe(plumber())
        .pipe(autoprefixer())
        .pipe(gulp.dest("dest/css"))
        .pipe(browser.reload({stream:true}));
});

//sassのコンパイル、ベンダープレフィックスの付与、ブラウザ更新
gulp.task("sass", function() {
    gulp.src("dest/scss/**/*scss")
        .pipe(plumber())
        .pipe(sass({
          outputStyle: 'compact'
        }))
        .pipe(autoprefixer())
        .pipe(gulp.dest("dest/css"))
        .pipe(browser.reload({stream:true}));
});

//jsの圧縮、ブラウザ更新
gulp.task("js", function() {
    gulp.src(["dest/js/**/*.js","!dest/js/min/**/*.js"])
        .pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest("dest/js/min"))
        .pipe(browser.reload({stream:true}));
});

//画像の圧縮
gulp.task("image-min",function(){
  	gulp.src(["dest/img/src/**/*"])
    		.pipe(plumber())
    		.pipe(imageMin())
    		.pipe(gulp.dest("dest/img/"));
});

//ブラウザ更新ディレクトリ設定
gulp.task("server", function() {
    browser({
        server: {
            baseDir: "./dest",
            option: "external"
        }
    });
});

//タスクをまとめてデフォルトで指定
gulp.task("default",['server'], function() {
    gulp.watch("dest/**/*html", ["html-reload"]);
    gulp.watch("dest/css/*css", ["css-reload"]);
    gulp.watch("dest/scss/**/*.scss",["sass"]);
    gulp.watch(["dest/js/**/*.js","!js/min/**/*.js"],["js"]);
    gulp.watch("dest/img/src/**/*", ["image-min"]);
});
