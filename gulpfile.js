'use strict';

var gulp = require('gulp'),
  clean = require('gulp-clean'),
  ngmin = require('gulp-ngmin'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglifyjs'),
  jshint = require('gulp-jshint'),
  Dgeni = require('dgeni'),
  path = require('canonical-path'),
  fs = require('fs'),
  _ = require('lodash'),
  runSequence = require('run-sequence'),
  rename = require('gulp-rename'),
  browserSync = require('browser-sync')
;




var paths = {
  src: 'src',
  coverage: 'test/coverage',
  build: 'dist',
  temp: 'tmp',
  docSrc: 'docs'
};



var components = [];

var createDocPackage = function(component) {

  try {
    var basePath = paths.src + '/' + component;
    var newDocs = new Dgeni.Package(component + '-docs', [require('./docs/dgeni-conf')])
      .config(function(log, readFilesProcessor, writeFilesProcessor) {
        // Set logging level
        log.level = 'info';
        readFilesProcessor.basePath = path.resolve(__dirname, '.');
        readFilesProcessor.sourceFiles = [
          {
            include: basePath + '/main.js',
            basePath: paths.src
          },
          {
            include:  basePath + '/*/**/*.js',
            basePath: paths.src
          }
        ];
        writeFilesProcessor.outputFolder  = paths.temp + '/docs';
      })
    ;

    return new Dgeni([newDocs]);

  } catch(x) {
    console.log(x.stack);
    throw x;
  }

};

gulp.task('docs-main', [], function() {
  try {

    var newDocs = new Dgeni.Package('toplevel-docs', [require('./docs/dgeni-toplev-conf')])
      .config(function(log, readFilesProcessor, writeFilesProcessor) {
        // Set logging level
        log.level = 'debug';
        readFilesProcessor.basePath = path.resolve(__dirname, '.');
        readFilesProcessor.sourceFiles = [
          {
            include: paths.src + '/*/main.js',
            basePath: paths.src
          },
          {
            include: paths.src + '/app.js',
            basePath: paths.src
          }

        ];
        writeFilesProcessor.outputFolder  = paths.build + '/docs';
      })
    ;

    return (new Dgeni([newDocs])).generate();

  } catch(x) {
    console.log(x.stack);
    throw x;
  }

});


// add a task for each component
var buildComponent = function(component) {
  return function() {

    var outpath = paths.build + '/js';

    return gulp.src([paths.src + '/' + component + '/**/*.js'], {base: paths.src})
      // output for docs
      .pipe(gulp.dest(paths.build + '/docs/src'))
      // process for dist version
      .pipe(concat('dcm-ui-' + component + '.js'))
      .pipe(gulp.dest(outpath))
      .pipe(rename({suffix: '.min'}))
      .pipe(ngmin())
      .pipe(uglify({outSourceMap: true, basePath: outpath}))
      .pipe(gulp.dest(outpath))
    ;
  };
};


var generateRawDocs = function(component) {
  return function() {
    try {
      return createDocPackage(component).generate();
    } catch(x) {
      console.log(x.stack);
      throw x;
    }
  };
};


var processDocs = function(component) {
  return function() {
    gulp.src(paths.temp + '/docs/partials/dcm-ui.' + component + '/**/*.html', {base: paths.temp + '/docs/partials/dcm-ui.' + component })
      .pipe(gulp.dest(paths.build + '/docs/views/' + component))
    ;
  };
};


var copyDocAssets = function(component) {
  return function () {
    return gulp.src([paths.src + '/' + component + '/**'])
      .pipe(gulp.dest(paths.build + '/docs/src/' + component))
    ;
  };
};



function getFolders(dir) {
  return fs.readdirSync(dir)
    .filter(function(file) {
      return fs.statSync(path.join(dir, file)).isDirectory();
    });
}



// setup tasks for each component
components = getFolders(path.resolve(__dirname, './src'));

_.each(components, function(component){

  // createDocPackage(component);

  gulp.task(component + '-build', [], buildComponent(component));
  gulp.task(component + '-gen-docs', [], generateRawDocs(component));
  gulp.task(component + '-doc-assets', [], copyDocAssets(component));
  gulp.task(component + '-docs', [component + '-gen-docs', component + '-doc-assets'], processDocs(component));
  gulp.task(component + '-reload', [component + '-build', component + '-docs']);

});

gulp.task('docs', function(callback) {

  var tasks = _.map(components, function(item){ return item + '-docs'; });

  tasks.push( ['docs-main', 'doc-assets', 'doc-examples', 'doc-main-js']);
  tasks.push(callback);

  runSequence.apply(this,tasks);
});


gulp.task('build', function(callback) {
  runSequence('clean', 'docs',  _.map(components, function(item){ return item + '-build'; }), callback);
});



gulp.task('doc-assets', function () {
  return gulp.src( paths.docSrc + '/assets/{bower_components,js,style}/**')
      .pipe(gulp.dest(paths.build + '/docs/assets'));
});

gulp.task('doc-main-js', function () {
  return gulp.src( paths.src + '/app.js')
      .pipe(gulp.dest(paths.build + '/docs/src'));
});

gulp.task('doc-examples', function () {
  return gulp.src( paths.temp + '/docs/examples/**')
      .pipe(gulp.dest(paths.build + '/docs/examples'));
});


gulp.task('clean-docs', function() {
  return gulp.src([paths.temp + '/docs', paths.build + '/docs'], {read: false})
    .pipe(clean())
  ;
});




gulp.task('clean', [], function() {
  return gulp.src([paths.build, paths.coverage, paths.temp], {read: false})
    .pipe(clean())
  ;
});




// file watchers
gulp.task('server', ['dev'], function () {

  // Rerun the build task when a file changes
  for (var idx in components) {
    gulp.watch([paths.src + '/' + components[idx] + '/**'], [components[idx] + '-reload']);
  }

  // watch asset templates dir
  gulp.watch(['docs/**', '!docs/assets/bower_components/**'], ['docs']);

  // watch examples output dir (and copy to dist/docs if changed)
  gulp.watch(['tmp/docs/examples/**'], function(changed){
    gulp.src([changed.path], {base: 'tmp/docs/examples/'})
      .pipe(gulp.dest(paths.build + '/docs/examples'))
    ;
  });


  // watch output docs dir (but ignore junk coming from bowewr_components)
  gulp.watch(['dist/docs/**', '!dist/docs/assets/bower_components/**'], _.debounce(browserSync.reload, 100));



});





gulp.task('test', function(){
  return gulp.src(paths.src + '/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
  ;
});


// Dev task
gulp.task('dev', ['build'], function() {

  browserSync({
    server: {
      baseDir: paths.build + '/docs',
      routes: {
        '/coverage': paths.coverage
      }
    },
    notify: false
  });

  //open browser
  // return gulp.src('dist/docs/index.html')
  //   .pipe( browser('index.html', { url: 'http://localhost:' + serverport + '/#/' }) )
  // ;

});









gulp.task('default', ['server']);

