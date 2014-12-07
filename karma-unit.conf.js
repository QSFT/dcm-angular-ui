'use strict';

var shared = require('./karma-shared.conf');
var files = require('./karma-unit-files.conf');

module.exports = function(config) {

  shared(config);
  files(config);

  config.set({
    preprocessors: {
      'src/*/**/*.js': 'coverage'
    },

    reporters: ['progress','coverage'],

    coverageReporter: {
      type : 'html',
      dir : 'test/coverage'
    }

  });

};
