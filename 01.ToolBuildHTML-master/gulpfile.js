const del = require("del")
gulp = require("gulp")
pug = require("gulp-pug")
sass = require("gulp-sass")
cssnano = require("cssnano")
babel = require("gulp-babel")
uglify = require("gulp-terser")
concat = require("gulp-concat")
rename = require("gulp-rename")
replace = require("gulp-replace")
plumber = require("gulp-plumber")
postcss = require("gulp-postcss")
prefixer = require("autoprefixer")
srcmap = require("gulp-sourcemaps")
cssImport = require("gulp-cssimport")
sassUnicode = require("gulp-sass-unicode")
cssDeclarationSorter = require("css-declaration-sorter")
browserSync = require("browser-sync").create()
readFileSync = require("graceful-fs").readFileSync


// Task clean
gulp.task("clean", function () {
	return del(["dist"]);
})


// Task copy fonts
gulp.task("copyFonts", function () {
	let glob = JSON.parse(readFileSync("config.json"));
	return gulp.src(glob.font, {
		allowEmpty: true
	})
		.pipe(gulp.dest("dist/fonts"));
})


// Task clean imagess
gulp.task("cleanImages", function () {
	return del(["dist/img"])
})


// Task copy img
gulp.task("copyImages", function () {
	return gulp.src("src/img/**/**.{svg,gif,png,jpg,jpeg}", {
		allowEmpty: true
	})
		.pipe(gulp.dest("dist/img"));
})

// Start task js
gulp.task("globalJs", function () {
	let glob = JSON.parse(readFileSync("config.json"))
	return gulp.src(glob.globalJs, {
		allowEmpty: true
	})
		.pipe(srcmap.init())
		.pipe(concat("global.min.js"))
		.pipe(uglify())
		.pipe(srcmap.write("."))
		.pipe(gulp.dest("dist/js"))
		.pipe(browserSync.reload({ stream: true }))
})
gulp.task("js", function () {
	return gulp.src("src/js/main.js", {
		allowEmpty: true
	})
		.pipe(srcmap.init())
		.pipe(babel({
			presets: ["@babel/env"]
		}))
		.pipe(uglify())
		.pipe(rename({
			suffix: ".min"
		}))
		.pipe(srcmap.write("."))
		.pipe(gulp.dest("dist/js"))
		.pipe(browserSync.reload({ stream: true }));
});
// End task JS


// Start task CSS
gulp.task("globalCss", function () {
	let glob = JSON.parse(readFileSync("config.json"))
	return gulp.src(glob.globalCss, {
		allowEmpty: true,
	})
		.pipe(srcmap.init())
		.pipe(concat("global.min.css"))
		.pipe(postcss([
			prefixer({
				browsers: ["last 4 version", "IE 10"],
				cascade: false,
			}),
			cssnano(),
			cssDeclarationSorter({ order: "smacss" })
		]))
		.pipe(srcmap.write("."))
		.pipe(gulp.dest("dist/css"))
		.pipe(browserSync.reload({ stream: true }))
})
gulp.task("css", function () {
	return gulp.src([
		"src/components/_core/**.sass",
		"src/components/**/**.sass"
	], {
			allowEmpty: true
		})
		.pipe(srcmap.init())
		.pipe(concat("main.sass"))
		.pipe(sass().on("error", sass.logError))
		.pipe(sassUnicode())
		.pipe(postcss([
			prefixer({
				browsers: ["last 4 version", "IE 10"],
				cascade: false,
			}),
			cssnano(),
			cssDeclarationSorter({ order: "smacss" })
		]))
		.pipe(rename({
			suffix: ".min"
		}))
		.pipe(srcmap.write("."))
		.pipe(gulp.dest("dist/css"))
		.pipe(browserSync.reload({ stream: true }))
});
// End task CSS


// Start task Html
gulp.task("html", function () {
	return gulp.src([
		"src/pages/*.pug",
		"!src/pages/\_*.pug"
	])
		.pipe(pug({
			pretty: "\t",
		}))
		.pipe(plumber())
		.pipe(gulp.dest("dist"))
		.pipe(browserSync.reload({ stream: true }));
});
// End task Html


// Task watch
gulp.task("serve", function () {
	browserSync.init({
		notify: false,
		server: {
			baseDir: "dist",
		},
		port: 8000
	}),
		gulp.watch(
			[
				"config.json",
				"_plugins/**.{css,js}"
			],
			gulp.parallel("globalJs", "globalCss")
		),
		gulp.watch(
			[
				"src/img/**/**.{svg,gif,png,jpg,jpeg}"
			],
			gulp.series("cleanImages", "copyImages")
		),
		gulp.watch(
			[
				"src/**/**.pug",
			],
			gulp.series("html")
		),
		gulp.watch(
			[
				"src/components/**/**.sass",
			],
			gulp.series("css")
		),
		gulp.watch(
			[
				"src/js/main.js",
			],
			gulp.series("js")
		),
		gulp.watch("dist/*").on("change", browserSync.reload)
})
// End task watch


// Gulp task defaul
gulp.task("default", gulp.series(
	"clean",
	"copyImages",
	"copyFonts",
	"globalCss",
	"globalJs",
	"html",
	"css",
	"js",
	"serve"
))