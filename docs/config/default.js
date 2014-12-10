'use strict';

module.exports = function defaultDeployment() {
  return {
    name: 'default',
    examples: {
      commonFiles: {
        scripts: [
          '/assets/bower_components/underscore/underscore.js',
          '/assets/bower_components/jquery/dist/jquery.js',
          '/assets/bower_components/select2/select2.js',
          '/assets/bower_components/angular/angular.js',

          '/src/app.js',

          '/src/grid/main.js',
          '/src/grid/controllers/dcmGridController.js',
          '/src/grid/directives/dcmGridDirective.js',
          '/src/grid/directives/dcmGridColumnDirective.js',
          '/src/grid/directives/dcmGridRowDirective.js',
          '/src/grid/directives/dcmGridRowActionsDirective.js',
          '/src/grid/services/datasource.js',
          '/src/grid/services/filters.js',

          '/src/multiple-input/main.js',
          '/src/multiple-input/directives/multipleInput.js',

          '/src/select2/main.js',
          '/src/select2/directives/dcmSelect2.js',

          '/src/slider/main.js',
          '/src/slider/directives/dcmSlider.js',

          '/src/helpers/services/drag.js',

          '/src/resizable-cols/main.js',
          '/src/resizable-cols/directives/resizableColumns.js',
          '/src/resizable-cols/directives/resizableColumn.js',
          '/src/resizable-cols/controllers/resizableColumnsCtrl.js'
        ],
        stylesheets: [
          '/assets/bower_components/bootstrap/dist/css/bootstrap.css',
          '/assets/bower_components/fontawesome/css/font-awesome.css',
          '/assets/bower_components/select2/select2.css',
          '/assets/bower_components/select2-bootstrap-css/select2-bootstrap.css'
        ]
      },
      dependencyPath: '../..'
    },
    scripts: [

    ],
    stylesheets: [

    ]
  };
};
