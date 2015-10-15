'use strict';

module.exports = function defaultDeployment() {


  /* adding all the source code as default scripts */
  var glob = require('glob');
  var _ = require('lodash');

  var srcScripts = ['src/app.js'].concat(glob.sync('src/*/main.js', {})).concat(glob.sync('src/*/*/**.js', {}));

  var includedFiles = {

    examples: {

      scripts: [
        'assets/bower_components/underscore/underscore.js',
        'assets/bower_components/jquery/dist/jquery.js',
        'assets/bower_components/select2/select2.js',
        'assets/bower_components/angular/angular.js',
      ],
      stylesheets: [
        'assets/bower_components/bootstrap/dist/css/bootstrap.css',
        'assets/bower_components/font-awesome/css/font-awesome.css',
        'assets/bower_components/select2/select2.css',
        'assets/bower_components/select2-bootstrap-css/select2-bootstrap.css'
      ],
      misc: []

    },

    indexPage: {

      scripts: [
        'assets/js/cui-vendor.min.js',
        'assets/js/cui.min.js',
        'assets/bower_components/marked/lib/marked.js',
        'assets/bower_components/google-code-prettify/src/prettify.js',
        'assets/bower_components/google-code-prettify/src/lang-css.js',
        'assets/js/angular-bootstrap.js',
        'assets/js/bootstrap-prettify.js'
      ],
      stylesheets: [
        'assets/style/cui.min.css',
        'assets/bower_components/bootstrap/dist/css/bootstrap.css',
        'assets/bower_components/font-awesome/css/font-awesome.css',
        'assets/style/docs.css',
        'assets/style/prettify-theme.css',
        'assets/style/prettify.css'
      ],
      misc: [
        'assets/style/fonts/**',
        'assets/bower_components/bootstrap/dist/css/bootstrap.css.map',
        'assets/bower_components/select2/*.{png,gif}',
        'assets/bower_components/font-awesome/fonts/**'
      ]

    }

  };



  var relativePath = function(path) {
    return '../../' + path;
  };



  return {

    name: 'default',

    examples: {
      commonFiles: {
        scripts: _.map(includedFiles.examples.scripts.concat(srcScripts), relativePath),
        stylesheets: _.map(includedFiles.examples.stylesheets, relativePath)
      },
      copyFiles: includedFiles.examples
    },

    indexPage: {
      commonFiles: {
        scripts: includedFiles.indexPage.scripts,
        stylesheets: includedFiles.indexPage.stylesheets
      },
      copyFiles: includedFiles.indexPage
    }

  };


};

