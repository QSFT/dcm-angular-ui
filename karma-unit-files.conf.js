'use strict';


var shared = function(config) {

  config.files = config.files.concat([
    //extra testing code

    // included js components

    'docs/assets/bower_components/angular/angular.js',
    'docs/assets/bower_components/angular-mocks/angular-mocks.js',
    'docs/assets/bower_components/select2/select2.js',

    // app code (make sure lowest level files are loaded first)
    'src/app.js',
    'src/*/main.js',

    // and submodules...
    'src/*/*/*.js',

    // unit tests
    'test/spec/**/*.js'

  ]);

};

module.exports = shared;