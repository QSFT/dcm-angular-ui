'use strict';
var shared = function(config) {

  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    reporters: ['progress'],
    browsers: ['PhantomJS'],
    plugins: [
      'karma-*'
    ],
    autoWatch: true,

    // these are default values anyway
    colors: true

  });

  config.files = [
    // included js components
    'docs/assets/bower_components/underscore/underscore.js',
    'docs/assets/bower_components/jquery/dist/jquery.js'
  ];

};


module.exports = shared;